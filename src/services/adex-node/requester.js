import Helper from 'helpers/miscHelpers'
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

    fetch({ route = '', queryParams, method = 'GET', body, headers = {}, userAddr, authSig = '', authToken }) {
        let query = Helper.getQuery(queryParams)
        let url = this.getUrl(BASE_URL, route, query)

        let hdrs = {
            'X-User-Address': userAddr,
            'X-User-Signature': authSig,
            'X-Auth-Token': authToken,
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

