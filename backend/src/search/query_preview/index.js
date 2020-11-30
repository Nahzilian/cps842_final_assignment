import { findAppearancesInText } from '../../utils.js'

export const termAppearancePositions = (
    term,
    docId,
    collection,
) => {
    const allText = allTextInDoc(docId, collection)
        .join(' ')

    return findAppearancesInText(term, allText)
}


const genDocPreviewObj = (
    collection,
) => ({
    id,
    similarity,
}) => ({
    id,
    similarity,
    title: collection[id].title || '',
    authors: collection[id].authors || [],
})


const displayDocPreview = ({
    id,
    similarity,
    title,
    authors,
}, rank) => {
    console.log('-------')
    console.log(`Document: ${id}`)
    console.log(`Title: ${title}`)
    console.log(`Authors: ${
        authors.length > 0
            ? authors.join(', ')
            : 'unknown'
    }`)
    console.log(`Rank: ${rank}`)
    console.log(`Similarity Score: ${similarity}`)
}

export const previewQuery = (
    queryTerms,
    relevantDocIds,
    collection,
    dictionary,
) => {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log(`Query: ${queryTerms.join(', ')}`)
    console.log(`Document frequency: ${
        queryTerms
            .map(term => dictionary[term])
            .join(', ')
    }`)

    relevantDocIds
        .map(genDocPreviewObj(collection))
        .map(displayDocPreview)

    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
}
