import { readAndParseQueryCollection } from './process/index.js'
import { meanAveragePrecision, averageRPrecision } from './compare/index.js'

import { getBestMatches, queryWeight } from '../search/tf_idf/index.js'

import { fileExists, readFile } from '../utils.js'
import { getStopWords } from "../stopwords.js"

// The location of the cache file
const DOC_CACHE_DEFAULT = './cache.json'
// The location of the dictionary
const DICT_DEFAULT = './dictionary.json'
// The location of the postings list
const POST_DEFAULT = './postings.json'
// The location of the stop words document
const STOP_WORDS_DEFAULT = './stopwords.txt'
// The location of the query document
const QUERIES_DEFAULT = './cacm/query.text'
// The location of the relevant query docs document
const QRELS_DEFAULT = './cacm/qrels.text'

// The inputs to the program are the two files generated from the previous program invert

// If the term is in one of the documents in the collection, the program 
// should display the document frequency and all the documents which contain 
// this term, for each document, it should display the document ID, the title, 
// the term frequency, all the positions the term occurs in that document, and 
// a summary of the document highlighting the first occurrence of this term with 
// 10 terms in its context.

export const evaluateModel = async (
    dictionary,
    postings,
    docCount,
    stopWords,
    useStemmer,
    queries,
) => {
    const queryIds = Object.keys(queries)

    queryIds.map(id => {
        const query = queries[id].queryText

        const queryWeights = queryWeight(
            query,
            docCount,
            dictionary,
            stopWords,
            useStemmer,
        )

        // Add the results of each query to the query objects
        queries[id].result = getBestMatches(
            queryWeights,
            dictionary,
            postings,
            docCount,
            stopWords,
        )
    })

    const MAP = meanAveragePrecision(queries)
    const rPrec = averageRPrecision(queries)

    console.log(`The MAP is ${MAP} and the R-Precision is ${rPrec}.`)
}


const main = async () => {
    const [
        dictArg,
        postingsArg,
        stopWordsArg,
        docCacheArg,
        queriesArg,
        qrelsArg,
    ] = Deno.args
    
    const docCache = docCacheArg || DOC_CACHE_DEFAULT
    const dictionaryFile = dictArg || DICT_DEFAULT
    const postingsFile = postingsArg || POST_DEFAULT
    const stopWordsFile = stopWordsArg || STOP_WORDS_DEFAULT
    const queriesFile = queriesArg || QUERIES_DEFAULT
    const qrelsFile = qrelsArg || QRELS_DEFAULT

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

        const queries = await readAndParseQueryCollection(queriesFile, qrelsFile)
    
        evaluateModel(
            dictionary,
            postingsList,
            Object.keys(collection).length,
            stopWords,
            useStemmer,
            queries,
        )
    }
}

await main()
