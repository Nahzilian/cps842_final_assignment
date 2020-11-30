import { exists, writeJson } from "https://deno.land/std@0.62.0/fs/mod.ts"
import { stemmer } from '../porter.js'

export const fileExists = async (fileName) =>
    exists(fileName)


export const readFile = async (fileName) => {
    console.log(`Reading file: ${fileName}...`)

    const decoder = new TextDecoder('utf-8')

    const file = await Deno.readFile(fileName)

    console.log(`Successfully read file: ${fileName}.`)

    return JSON.parse(decoder.decode(file))
}


export const writeFile = async (
    fileName,
    file,
) => {
    console.log(`Writing out file: ${fileName}...`)

    await writeJson(fileName, file)

    console.log(`Successfully wrote file: ${fileName}.`)
}


export const sortObjectByKeys = (object) => {
    const ordered = {}

    Object.keys(object)
        .sort()
        .forEach(key => {
            ordered[key] = object[key]
        })

    return ordered
}


export const removeDuplicateTerms = (terms) => {
    return terms.filter(
        (a, b) => terms.indexOf(a) === b
    )
}


const dotProduct = (x, y) =>
    x.map((xTerm, index) => {
        return xTerm * y[index]
    })
    .reduce((acc, curr) => acc + curr, 0)


export const cosineSimilarity = (X, Y) =>
    dotProduct(X, Y) / (
        Math.sqrt(
            dotProduct(X, X)
        ) * Math.sqrt(
            dotProduct(Y, Y)
        )
    )


// Turn a string into a filtered list of only relevant words
export const stringToFilteredList = (original, stopWords, dictionary, useStemmer) =>
    original
        .toLowerCase()
        // Filter out non-alphabetical, non-numeric characters
        .replace(/[^a-z]+/g, ' ')
        .split(' ')
        // Remove empty strings
        .filter(word => word !== '')
        // Remove stopwords
        .filter(word => !stopWords.includes(word))
        // Use Porter's stemming algorithm
        .map(porterStemmer(useStemmer))
        // If there's a dictionary, remove words that aren't in it
        .filter(word => !dictionary || !!dictionary[word])


export const arrayAvg = (array) =>
    array.reduce((acc, curr) =>
        (acc + curr), 0
    ) / array.length

export const porterStemmer = (useStemmer) => (word) =>
    !!useStemmer ? stemmer(word) : word

export const findAppearancesInText = (word, text) => {
    const indicies = []
    
    for (let i = 0; i < text.length; i++) {
        if (text.substring(i, i + word.length) == word) {
            indicies.push(i)
        }
    }
    
    return indicies
}
