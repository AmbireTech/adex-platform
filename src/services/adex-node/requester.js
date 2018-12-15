import Helper from 'helpers/miscHelpers'
import {  isDemoMode, getAccount } from 'services/store-data/auth'

const BASE_URL = process.env.ADEX_NODE_HOST || 'https://node.adex.network' //TODO: config

class AdexNodeRequester {
    getAuthHeaders = () => {
        const acc = getAccount()
        return {
            'X-User-Address': acc._addr,
            'X-User-Signature': acc._authSig,
            'X-Auth-Token': acc._authToken,
        }
    }

    getUrl = (base, route, query) => {
        let url = base + '/'
        if (route) {
            route = route.replace(/^\//, '')
            url += route
        }

        url += query

        return url
    }

    fetch = ({ route = '', queryParams = {}, method = 'GET', body, headers = {}, userAddr, authSig = '', authToken }) => {
        const qp = { ...queryParams }
        if (isDemoMode()) {
            qp.demo = true
        }

        let query = Helper.getQuery(qp)
        let url = this.getUrl(BASE_URL, route, query)

        let hdrs = {
            ...this.getAuthHeaders(),
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

