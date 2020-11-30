import { serve } from "https://deno.land/std@0.79.0/http/server.ts"

const server = serve({
    hostname: "0.0.0.0",
    port: 3001,
})

console.log(`Web Search webserver running.  Access it at:  http://localhost:3001/`)

const getQueryParams = (url) => {
    if (url != '') {
        const plusSignRegex = /\+/g  // Regex for replacing addition symbol with a space
        const queryParamRegex = /([^&=]+)=?([^&]*)/g
        const decode = (s) => decodeURIComponent(s.replace(plusSignRegex, ' '))
        const queryParamsString  = url.split('?')[1]
        
        if (queryParamsString != '') {
            let param
            while (param = queryParamRegex.exec(queryParamsString)) {
                queryParams[decode(param[1])] = decode(param[2])
            }

            return queryParams
        }
    }
}

for await (const req of server) {
    const queryParams = getQueryParams(req.url)
    console.log(JSON.stringify(queryParams))
    // const results = await handleSearch(queryParams.query)

    req.respond({
        status: 200,
        body: "Hello world",
        // body: results,
    })
}