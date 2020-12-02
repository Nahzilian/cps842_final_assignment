import { calculatePageRanks } from './page_rank.js'
import { tfIdf } from '../search/index.js'
import {
    removeDuplicateTerms,
    getAllDocumentTerms,
} from '../utils.js'

/**
 * Gets the inverted index, dictionary, and document info objects
 * @param {Array<{
 *  org_url: string,
 *  linked_urls: Array<string>,
 *  title: string,
 *  body: string,
 * }>} docCollection The collection of websites
 * @param {Array<string>} stopWords The stop words to remove (can be an empty array)
 * @param {boolean} useStemmer Whether or not to use the stemmer
 */
export const getInvertedIndex = async (docCollection, stopWords, useStemmer) => {
    console.log('Calculating PageRank scores...')
    const { urlIds, pageRanks } = await calculatePageRanks(docCollection)
    // console.log(pageRanks)
    console.log('Successfully calculated PageRank scores.')

    console.log('Creating inverted index and dictionary...')

    let dictionary = {}
    let postingsList = {}
    let docsInfo = {}

    const docIds = Object.keys(docCollection)
    const docCount = docIds.length

    // Create the postings and dictionary
    docCollection.map((doc, docId) => {
        const docTerms = getAllDocumentTerms(
            doc,
            stopWords,
            useStemmer,
        )

        // Add the terms to the dictionary
        const docTermsWithoutDuplicates = removeDuplicateTerms(docTerms)

        docsInfo[docId] = createNewDocInfo(docTermsWithoutDuplicates)

        docTermsWithoutDuplicates.map(term => insertIntoDictionary(term, dictionary))

        // Add the terms to the postings list
        docTerms.map(term =>
            addTermPosting(term, postingsList, docId)
        )
    })
    console.log('Successfully created inverted index and dictionary.')

    console.log('Vectorizing links...')
    // Now that the postings and dictionaries have been created,
    // caluclate the weights for the documents
    docCollection.map((doc, docId) => {
        const terms = docsInfo[docId].terms

        docsInfo[docId] = {
            // Inserting new information into the document info
            ...docsInfo[docId],
            // Create a vector-ish representation that maps each word to
            // it's TF-IDF value
            vectorRepresentation: terms.reduce((acc, term) => ({
                ...acc,
                [term]: tfIdf(
                    term,
                    dictionary,
                    postingsList[term][docId],
                    docCount,
                ),
            }), {}),
            // Grab the PageRank score using the row number of the URL
            pageRankScore: pageRanks[docId],
        }
    })

    console.log('Successfully vectorized links.')

    return { dictionary, postingsList, docsInfo }
}


const insertIntoDictionary = (term, dictionary) => {
    // Update the document frequency
    if (!dictionary[term]) {
        dictionary[term] = 1
    } else {
        dictionary[term]++
    }
}


const addTermPosting = (term, postingsList, docId) => {
    if (!postingsList[term]) {
        postingsList[term] = {}
    }

    if (postingsList[term][docId] === undefined) {
        postingsList[term][docId] = 0
    }

    // Update the term frequency within the document
    postingsList[term][docId]++
}


/**
 * Creates a new entry for the document info list
 * @param {Array<string>} terms The terms in the document (without repetitions)
 * @param {number} pageRankScore The PageRank score of the document
 * @param {Record<string, number>} vectorRepresentation Maps words
 * in the document to their TF-IDF value
 */
const createNewDocInfo = (
    terms,
    pageRankScore,
    vectorRepresentation,
) => ({
    terms: terms || [],
    pageRankScore: pageRankScore || NaN,
    vectorRepresentation: vectorRepresentation || {},
})