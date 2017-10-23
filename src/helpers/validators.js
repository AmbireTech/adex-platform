// TODO: check the regex
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

export function validUrl(url) {
    let isValid = urlRegex.test(url)
    return isValid
}

