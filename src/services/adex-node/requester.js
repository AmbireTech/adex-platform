const BASE_URL = 'http://127.0.0.1:9710/' //TODO: config

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
        if (!queryParams) return ''
        return '?' + Object.keys(queryParams).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key])
        }, '').join('&') || ''
    }

    fetch({ route = '', queryParams, method = 'GET', body, headers = {}, userAddr, authSig = '' }) {
        let query = this.getQuery(queryParams)
        let url = this.getUrl(BASE_URL, route, query)

        let hdrs = {
            // 'useraddres': userAddr, //TEMP
            'usersignature': authSig,
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

