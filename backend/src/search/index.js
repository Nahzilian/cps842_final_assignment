import { readLines } from "https://deno.land/std@v0.62.0/io/bufio.ts"
import { getBestMatches, queryWeight } from './tf_idf/index.js'

import { fileExists, readFile, arrayAvg } from '../utils.js'
import { getStopWords } from "../stopwords.js"

import { previewQuery } from './query_preview/index.js'

// The location of the cache file
const DOC_CACHE_DEFAULT = './cache.json'
// The location of the dictionary
const DICT_DEFAULT = './dictionary.json'
// The location of the postings list
const POST_DEFAULT = './postings.json'
// The location of the stop words document
const STOP_WORDS_DEFAULT = './stopwords.txt'

const TOP_K = 15
// // No limit to amount of results returned
// const TOP_K = false

// The inputs to the program are the two files generated from the previous program invert

// If the term is in one of the documents in the collection, the program 
// should display the document frequency and all the documents which contain 
// this term, for each document, it should display the document ID, the title, 
// the term frequency, all the positions the term occurs in that document, and 
// a summary of the document highlighting the first occurrence of this term with 
// 10 terms in its context.

export const runMainLoop = async (
    dictionary,
    postings,
    docCount,
    stopWords,
    collection,
    useStemmer,
) => {
    let retrievalTimes = []

    let query = ''

    while (query != 'ZZEND') {
        console.log('Please enter a new query:')

        query = (await readLines(Deno.stdin).next()).value

        if (query != 'ZZEND') {

            const queryStart = new Date()

            const queryWeights = queryWeight(
                query,
                docCount,
                dictionary,
                stopWords,
                useStemmer,
            )

            const relevantDocIds = getBestMatches(
                queryWeights,
                dictionary,
                postings,
                docCount,
                stopWords,
            )

            previewQuery(
                queryWeights.queryTerms,
                !!TOP_K
                    ? relevantDocIds.slice(0, TOP_K)
                    : relevantDocIds,
                collection,
                dictionary,
            )

            const elapsedTime = (new Date()) - queryStart

            console.log(`Elapsed time for query (in ms): ${elapsedTime}`)

            retrievalTimes.push(elapsedTime)
        }
    }

    console.log(`Average elapsed time (in ms): ${arrayAvg(retrievalTimes)}`)
    console.log('Exiting.')
}


const main = async () => {
    const [
        dictArg,
        postingsArg,
        stopWordsArg,
        docCacheArg,
    ] = Deno.args
    
    const docCache = docCacheArg || DOC_CACHE_DEFAULT
    const dictionaryFile = dictArg || DICT_DEFAULT
    const postingsFile = postingsArg || POST_DEFAULT
    const stopWordsFile = stopWordsArg || STOP_WORDS_DEFAULT

    const useStemmer = Deno.args.includes('-s') ||
        Deno.args.includes('--use-stemmer')

    const useStopWords = Deno.args.includes('-w') ||
        Deno.args.includes('--use-stopwords')

    const [ dictExists, postingsExists ] = await Promise.all([
        fileExists(dictionaryFile),
        fileExists(postingsFile)
    ])
    
    if (!dictExists || !postingsExists) {
        console.log('Dictionary or postings list entered does not exist.')
        console.log('Please run `invert.sh` to create them.')
    } else {
        const [
            collection,
            dictionary,
            postingsList,
            stopWords,
        ] = await Promise.all([
            readFile(docCache),
            readFile(dictionaryFile),
            readFile(postingsFile),
            getStopWords(stopWordsFile, useStopWords),
        ])
    
        runMainLoop(
            dictionary,
            postingsList,
            Object.keys(collection).length,
            stopWords,
            collection,
            useStemmer,
        )
    }
}

await main()

export const handleSearch = (query) => {
    
}
