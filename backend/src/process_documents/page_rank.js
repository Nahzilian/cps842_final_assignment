import Pagerank from '../../pagerank.js'

const collectUrls = (websites) => {
    let currId = 0

    const urlList = {}

    let website
    // For all the websites
    for (let i = 0; i < websites.length; i++) {
        website = websites[i]

        // If the current website hasn't been assigned an ID, assign it
        if (urlList[website.org_url] == undefined) {
            urlList[website.org_url] = currId
            currId++
        }

        // If any of the website's linked URLs haven't been assigned
        // an ID, assign it.
        // We use an && statement because it doesn't matter if there
        // are no linked urls
        !!website.linked_urls && website.linked_urls.map(linked => {
            if (urlList[linked] == undefined) {
                urlList[linked] = currId
                currId++
            }
        })
    }

    return urlList
}

const websiteToLinkMatrix = (urlIds) => (website) => {
    return website.linked_urls
        .map(linked => urlIds[linked])
}

// -----------------
// THE MAIN FUNCTION
// -----------------
export const calculatePageRanks = (websites) => {
    const urlIds = collectUrls(websites)

    const pageRankMap = websites.map(
        websiteToLinkMatrix(urlIds)
    )

    const linkProb = 0.85
    const tolerance = 0.002 // Faster to compute, might be less accurate

    const pageRanks = Pagerank(pageRankMap, linkProb, tolerance, (err, res) => {
        if (err) {
            throw new Error(`PageRank failed: ${JSON.stringify(err)}`)
        }
  
        return res
    })

    return { urlIds, pageRanks }
}