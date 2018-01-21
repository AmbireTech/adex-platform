const BASE_URL = 'http://127.0.0.1:7878/' //TODO: config

class AdexNodeRequester {
    getUrl(base, route, query) {
        let url = base
        if (route) {
            route = route.replace(/^\//, '')
            url += route
        }

        url += query

        return url
    }

    getQuery(queryParams) {
        return Object.keys(queryParams).reduce((memo, key, index) => {
            let qparam = ''
            if (index === 0) {
                qparam += '?'
            }

            qparam += (key + '=' + queryParams[key])
            memo += qparam
            return memo
        }, '') || ''
    }

    fetch({ route = '', queryParams = {}, method = 'GET', body, headers = {}, userAddr }) {
        let query = this.getQuery(queryParams)
        let url = this.getUrl(BASE_URL, route, query)

        let hdrs = {
            'useraddres': userAddr, //TEMP
            ...headers
        }

        return fetch(url, {
            method: method,
            headers: hdrs,
            body: body
        })
    }
}

export default new AdexNodeRequester()

