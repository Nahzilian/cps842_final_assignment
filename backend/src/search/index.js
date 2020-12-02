import {
    removeDuplicateTerms,
    cosineSimilarity,
    stringToFilteredList,
} from '../utils.js'

export const tfIdf = (queryTerm, dictionary, frequency, docCount) =>
    (
        1 + Math.log(frequency)
    ) * Math.log(docCount / dictionary[queryTerm])



const getRevelantDocs = (queryTerms, dictionary, postings) =>
    // Otherwise, return the list of documents that have
    // at least one of the query terms in it
    removeDuplicateTerms(
        queryTerms.reduce((acc, currTerm) => {
            const relevantDocsForTerm = (
                !dictionary[currTerm] ||
                !postings[currTerm]
            )
                // If the query term is not present in any documents,
                // return an empty array
                ? []
                : Object.keys(postings[currTerm])
        
            return [
                ...acc,
                // Get all of the document IDs from the postings list
                ...relevantDocsForTerm,
            ]
        }, [])
    )


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

    // The weights is a map of the term to its TF-IDF weight
    const weights = queryTerms.reduce((acc, term) => ({
        ...acc,
        [term]: tfIdf(
            term,
            dictionary,
            // Count the nuber of appearances of 
            // the term in the query
            queryTerms
                .filter(word => word == term)
                .length,
            docCount,
        )
    }), {})

    return { queryTerms, weights }
}



const getDocQueryRankingInfo = (queryTerms, queryWeights, docInfo) => {
    const docTerms = docInfo.terms
    const docTermWeights = docInfo.vectorRepresentation

    // Get the list of all the terms
    const allTerms = removeDuplicateTerms([
        ...docTerms,
        ...queryTerms,
    ])

    const docVector = []
    const queryVector = []

    // For each term, place its weight into the vector
    allTerms.map(term => {
        // If the term exists in the document, push its weight
        // If not, push zero
        docVector.push(
            docTermWeights[term] != undefined
                ? docTermWeights[term]
                : 0
        )

        // If the term exists in the document, push its weight
        // If not, push zero
        queryVector.push(
            queryWeights[term] != undefined
                ? queryWeights[term]
                : 0
        )
    })

    const similarity = cosineSimilarity(docVector, queryVector)
    const pageRankScore = docInfo.pageRankScore

    return { similarity, pageRankScore }
}


const getWeightedRank = (
    weightTowardsSimilarity,
    { similarity, pageRankScore }
) =>
    (
        (weightTowardsSimilarity * similarity) +
        (
            (1 - weightTowardsSimilarity) * pageRankScore
        )
    )


/**
 * Returns an array of the best matching document IDs,
 * sorted by relevance
 * @param {{
 *  queryTerms: Array<string>,
 *  weights: Record<string, number>,
 * }} parsedQueryInfo 
 * @param {Record<string, number>} dictionary 
 * @param {Record<string, Record<string, number>>} postings 
 * @param {Array<{
 *  org_url: string,
 *  linked_urls: Array<string>,
 *  title: string,
 *  body: string,
 * }>} documentCollection 
 * @param {Record<string, {
 *  terms: Array<string>,
 *  pageRankScore: number,
 *  vectorRepresentation: Record<string, number>,
 * }>} docsInfo 
 */
export const getBestMatches = (
    parsedQueryInfo,
    dictionary,
    postings,
    documentCollection,
    docsInfo,
) => {
    const {
        queryTerms,
        weights: queryWeights,
    } = parsedQueryInfo

    // Get a list of the IDs of relevant documents
    const docIds = getRevelantDocs(
        queryTerms,
        dictionary,
        postings,
    )

    // Compile the documents into objects containing their
    // IDs, information (including title, URL, and body),
    // and ranks
    const docsWithRanks = docIds.map(id => ({
        ...documentCollection[id],
        id,
        rank: getWeightedRank(
            0.7,
            getDocQueryRankingInfo(
                queryTerms,
                queryWeights,
                docsInfo[id],
            )
        ),
    }))

    // Return the list of relevant documents,
    // sorted by relevance
    return docsWithRanks
        .sort((a, b) => b.rank - a.rank)
}
