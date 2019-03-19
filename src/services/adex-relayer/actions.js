import Requester from 'services/requester'

const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST

const requester = new Requester({ baseUrl: ADEX_RELAYER_HOST })

const processResponse = (res) => {

    if(res.status >= 200 && res.status < 400) {
        return res.json()
    } else {
        return res.text()
        .then((text) => {
            throw { status: res.status, error: res.statusText + ' - ' + text }
        })
    }
}

export const identityToEmail = ({identity, privileges, mail }) => {
    return requester.fetch({
        route: 'identity/info-mail',
        method: 'POST',
        body: JSON.stringify({
            identity,
            privileges,
            mail
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(processResponse)
}

export const quickAccount = ({ownerAddr, mail, couponCode}) => {
    return requester.fetch({
        route: 'identity/quick-account',
        method: 'POST',
        body: JSON.stringify({
            mail,
            ownerAddr
        }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(processResponse)
}

export const checkCoupon = ({coupon}) => {
    return requester.fetch({
        route: `identity/valid-coupon/${coupon}`,
        method: 'GET'
    })
    .then(processResponse)
}

