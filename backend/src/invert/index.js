import { readAndParseDocCollection } from './doc_collection/index.js'
import { fileExists, readFile, writeFile, sortObjectByKeys } from '../utils.js'
import { getInvertedIndex } from './inverted_index/index.js'
import { getStopWords } from '../stopwords.js'

// The location of the document collection file
const COLLECTION_DOC_DEFAULT = './cacm/cacm.all'
// The location of the cache file
const DOC_CACHE_DEFAULT = './cache.json'

// The location of the dictionary
const DICT_DEFAULT = './dictionary.json'
// The location of the postings list
const POST_DEFAULT = './postings.json'
// The location of the stop words document
const STOP_WORDS_DEFAULT = './stopwords.txt'

const main = async () => {
  const [
    dictArg,
    postingsArg,
    stopWordsArg,
    docCacheArg,
    collectionDocArg,
  ] = Deno.args

  const docCache = docCacheArg || DOC_CACHE_DEFAULT
  const dictionaryFile = dictArg || DICT_DEFAULT
  const postingsFile = postingsArg || POST_DEFAULT
  const stopWordsFile = stopWordsArg || STOP_WORDS_DEFAULT
  const collectionDoc = collectionDocArg || COLLECTION_DOC_DEFAULT

  const USE_DOC_CACHE = !(
    Deno.args.includes('-nc') ||
    Deno.args.includes('--no-cache')
  )

  const useStemmer = Deno.args.includes('-s') ||
        Deno.args.includes('--use-stemmer')

    const useStopWords = Deno.args.includes('-w') ||
        Deno.args.includes('--use-stopwords')

  // If a doc collection cache exists, use it
  const hasCache = await fileExists(docCache)
  const collection = (hasCache && USE_DOC_CACHE)
    ? await readFile(docCache)
    : await readAndParseDocCollection(collectionDoc)

  // If no doc collection cache exists yet or we recreated the collection,
  // write it to the cache
  if (!hasCache || !USE_DOC_CACHE) {
    await writeFile(docCache, collection)
  }

  const stopWords = await getStopWords(stopWordsFile, useStopWords)

  // Create the dictionary and postings list, ignoring stop words
  const { dictionary, postingsList } = getInvertedIndex(
    collection,
    stopWords,
    useStemmer,
  )

  // Write out the sorted dictionary and postings list
  await writeFile(dictionaryFile, sortObjectByKeys(dictionary))
  await writeFile(postingsFile, sortObjectByKeys(postingsList))
}

await main()
