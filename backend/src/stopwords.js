import { fileExists } from './utils.js'

export const getStopWords = async (fileName, useStopWords) => {
    if (!useStopWords) return []

    const exists = await fileExists(fileName)
    if (!exists) {
        console.log(`Stop-word file not found: ${fileName}.`)

        return []
    }

    console.log(`Reading file: ${fileName}...`)

    const file = await Deno.readTextFile(fileName)

    console.log(`Successfully read file: ${fileName}.`)

    return file
        .toLowerCase()
        // Filter out non-alphabetical characters
        .replace(/[^a-z]+/g, ' ')
        .split(' ')
}