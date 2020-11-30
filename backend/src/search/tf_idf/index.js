import {
    removeDuplicateTerms,
    cosineSimilarity,
    stringToFilteredList,
} from '../../utils.js'

const tfIdf = (queryTerm, dictionary, frequency, docCount) =>
    (
        1 + Math.log(frequency)
    ) * Math.log(docCount / dictionary[queryTerm])


const queryWeightsPerDoc = (queryTerm, dictionary, postings, docCount) => {
    // If the query term is not present in any documents,
    // return an empty array
    if (!dictionary[queryTerm] || !postings[queryTerm]) {
        return []
    }

    const docs = Object.keys(postings[queryTerm])

    return docs
        .reduce((acc, docId) => {
            const currDocFreq = !!postings[queryTerm][docId]
                ? postings[queryTerm][docId]
                : 0
            
            return  {
                ...acc,
                [docId]: tfIdf(
                    queryTerm,
                    dictionary,
                    currDocFreq,
                    docCount,
                ),
            }
        }, {})
}


export const queryWeight = (
    query,
    docCount,
    dictionary,
    stopWords,
    useStemmer,
) => {
    const queryTerms = stringToFilteredList(
        query,
        stopWords,
        dictionary,
        useStemmer,
    )

    const weights = queryTerms.map(term => {
        // Count the nuber of appearances of 
        // the term in the query
        const queryTermFreq = queryTerms
            .filter(word => word == term)
            .length
        
        return tfIdf(term, dictionary, queryTermFreq, docCount)
    })

    return { queryTerms, weights }
}


// Returns an array of the best matching document IDs,
// sorted by relevance
export const getBestMatches = (
    queryWeights,
    dictionary,
    postings,
    docCount,
) => {
    const {
        queryTerms,
        weights: queryWeightVector,
    } = queryWeights

    // Create an object whose keys are the terms and whose
    // values are an array of weights per document
    const queryDocWeights = removeDuplicateTerms(queryTerms)
        .reduce((acc, currTerm) => ({
            ...acc,
            [currTerm]: queryWeightsPerDoc(currTerm, dictionary, postings, docCount)
        }), {})

    // Get the list of all the document IDs that are relevant to
    // the current query
    const allRelevantDocs = removeDuplicateTerms(
        Object.keys(queryDocWeights).reduce((
            acc,
            termDocWeights,
        ) => {
            return [
                ...acc,
                ...Object.keys(queryDocWeights[termDocWeights])
            ]
        }, [])
    )

    // Return an array of objects consisting of the document
    // ID and its weight vector for the current query
    const docWeightVectors = allRelevantDocs
        .reduce((acc, currDocId) => [
            ...acc,
            {
                id: currDocId,
                weightVector: getDocQueryWeightVector(
                    queryTerms,
                    currDocId,
                    queryDocWeights,
                )
            },
        ], [])

    // Return the list of relevant document IDs,
    // sorted by relevance (cosine similarity)
    return docWeightVectors
        // Here, we calculate the document cosine similarity
        .map(doc => ({
            ...doc,
            similarity: cosineSimilarity(
                queryWeightVector,
                doc.weightVector,
            ),
        }))
        // Here, we sort by cosine similarity (descending)
        .sort((a, b) => b.similarity - a.similarity)
        // Here, we only return the document id
        .map(({ id, similarity }) => ({ id, similarity }))
}


// Creates a vector of the weights for each term per document
const getDocQueryWeightVector = (queryTerms, docId, queryDocWeights) =>
    // For each term of the 
    queryTerms.map(term =>
        // Either get the document tfIdf of the term or
        // return 0
        !!queryDocWeights[term][docId]
            ? queryDocWeights[term][docId]
            : 0
    )
