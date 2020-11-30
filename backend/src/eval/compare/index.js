import { arrayAvg } from "../../utils.js"

export const meanAveragePrecision = (queries) => {
    const usableQueryIds = Object.keys(queries)
        .filter(id =>
            // Filter away empty queries
            queries[id].queryText != '' &&
            // Filter away queries with no relevant 
            // docs to compare against
            queries[id].relevantDocs.length > 0
        )

    const APs = usableQueryIds
        .map(id => averagePrecision(queries[id]))

    return (
        APs
            // Sum the average precisions
            .reduce((total, num) => total + num, 0)
    ) / usableQueryIds.length
}

const averagePrecision = ({
    result,
    relevantDocs,
}) => {
    if (result.length == 0) {
        return 0
    }

    const precisions = result.map(({ id }, index) => {
        if (!relevantDocs.includes(id)) {
            return 0
        }

        // All of the result documents until now
        const A = result
            .map(({ id }) => id)
            .slice(0, index + 1)

        const RintersectionA = A
            .filter(docId => relevantDocs.includes(docId))

        // Return the precision
        return RintersectionA.length / A.length
    })

    // return arrayAvg(precisions)
    return precisions.reduce((acc, curr) =>
        (acc + curr), 0
    ) / relevantDocs.length
}

export const averageRPrecision = (queries) => {

    const usableQueryIds = Object.keys(queries)
        .filter(id =>
            // Filter away empty queries
            queries[id].queryText != '' &&
            // Filter away queries with no relevant 
            // docs to compare against
            queries[id].relevantDocs.length > 0
        )

    const littleR = usableQueryIds
        .map(id => rPrecision(queries[id]))

    return (
        littleR
            // Sum the R-Precisions
            .reduce((total, num) => total + num, 0)
    ) / usableQueryIds.length
}

const rPrecision = ({
    result,
    relevantDocs,
}) => {
    return (
        result
            .slice(0, relevantDocs.length)
            .map(({ id }) => id)
            .filter(id => relevantDocs.includes(id))
            .length
    ) / relevantDocs.length
}
