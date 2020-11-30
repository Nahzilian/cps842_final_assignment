import { removeDuplicateTerms, stringToFilteredList } from '../../utils.js'


export const getInvertedIndex = (docCollection, stopWords, useStemmer) => {
    console.log('Creating inverted index...')

    let dictionary = {}
    let postingsList = {}

    const docIds = Object.keys(docCollection)

    docIds.map(docId => {
        const docTerms = getAllDocumentTerms(
            docCollection[docId],
            stopWords,
            useStemmer,
        )

        // Add the terms to the dictionary
        removeDuplicateTerms(docTerms)
            .map(term => insertIntoDictionary(term, dictionary))

        // Add the terms to the postings list
        docTerms.map(term =>
            addTermPosting(term, postingsList, docId)
        )
    })

    console.log('Successfully created inverted index.')

    return { dictionary, postingsList }
}


const getAllDocumentTerms = (document, stopWords, useStemmer) => {
    // Combine everything into a single string
    // and return it as a list
    return stringToFilteredList(
        `${document.title} ${document.abstract}`,
        stopWords,
        undefined,
        useStemmer,
    )
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
