import Helper from 'helpers/miscHelpers'
import configureStore from 'store/configureStore'

const BASE_URL = process.env.ADEX_NODE_HOST || 'https://node.adex.network' //TODO: config

const { store } = configureStore

class AdexNodeRequester {
    getAuthHeaders = () => {
        const account = store.getState().persist.account
        const acc = account

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

    fetch = ({ route = '', queryParams, method = 'GET', body, headers = {}, userAddr, authSig = '', authToken }) => {
        let query = Helper.getQuery(queryParams)
        let url = this.getUrl(BASE_URL, route, query)
        const persist = store.getState().persist
        const acc = persist.account._addr

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

