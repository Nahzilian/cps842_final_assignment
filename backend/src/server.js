import { serve } from "https://deno.land/std@0.79.0/http/server.ts"
import { fileExists, readFile } from './utils.js'
import { getInvertedIndex } from './process_documents/index.js'
import { getStopWords } from "./stopwords.js"
import { getBestMatches, queryWeight } from "./search/index.js"

const LINKS_DOCUMENT_FILENAME = './src/format_examples/theeyeopener.json'

const getQueryParams = (url) => {
    if (url != '') {
        const plusSignRegex = /\+/g  // Regex for replacing addition symbol with a space
        const queryParamRegex = /([^&=]+)=?([^&]*)/g
        const decode = (s) => decodeURIComponent(s.replace(plusSignRegex, ' '))
        const queryParamsString  = url.split('?')[1]

        const queryParams = {}
        
        if (queryParamsString != '') {
            let param
            while (param = queryParamRegex.exec(queryParamsString)) {
                queryParams[decode(param[1])] = decode(param[2])
            }
        }

        return queryParams
    }
}


const onBoot = async (
    linksFilename,
    stopWordsFilename,
    useStopWords,
    useStemmer,
) => {
    const linksExist = await fileExists(linksFilename)

    if (!linksExist) {
        throw new Error(`Links file ${linksFilename} does not exist`)
    }

    const linksFile = (await readFile(linksFilename))
        // Ensure that the link isn't empty
        .filter(l => !!l)
    const stopWords = await getStopWords(stopWordsFilename, useStopWords)

    const invertedIndexFiles = await getInvertedIndex(linksFile, stopWords, useStemmer)

    return {
        ...invertedIndexFiles,
        stopWords,
        linksFile,
    }
}


const handleQuery = (
    documentCollection,
    dictionary,
    postingsList,
    docsInfo,
    stopWords,
    useStemmer,
) => (query) => {
    const queryWeights = queryWeight(
        query,
        Object.keys(docsInfo).length,
        dictionary, 
        stopWords,
        useStemmer,
    )

    console.log(`Searching for ${JSON.stringify(queryWeights.queryTerms)}`)

    const results = getBestMatches(
        queryWeights,
        dictionary,
        postingsList,
        documentCollection,
        docsInfo,
    )

    console.log(`Found ${results.length} results.`)

    return results
}


const runServer = async () => {
    const USE_STOP_WORDS = true
    const USE_STEMMER = true

    console.log('Booting Web Search webserver...')

    const {
        dictionary,
        postingsList,
        docsInfo,
        stopWords,
        linksFile,
    } = await onBoot(
        LINKS_DOCUMENT_FILENAME,
        './stopwords.txt',
        USE_STOP_WORDS,
        USE_STEMMER,
    )

    const server = serve({
        hostname: "0.0.0.0",
        port: 3001,
    })
    
    console.log(`Web Search webserver running.  Access it at:  http://localhost:3001/`)

    // Set up a query handler. We use a function that outputs
    // a function so we can pass in variables that don't change
    const queryHandler = handleQuery(
        linksFile,
        dictionary,
        postingsList,
        docsInfo,
        stopWords,
        USE_STEMMER,
    )

    for await (const req of server) {
        const queryParams = getQueryParams(req.url)
        const query = queryParams.query

        if (!!query) {
            const results = queryHandler(query)

            const headers = new Headers()
            headers.append("access-control-allow-origin", "*")
            headers.append(
                "access-control-allow-headers",
                "Origin, X-Requested-With, Content-Type, Accept, Range",
            )
            headers.append("Content-type", "application/json")

            req.respond({
                headers,
                status: 200,
                body: JSON.stringify(results),
            })
        }
    }
}

await runServer()
