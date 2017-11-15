// TODO: check the regex
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i


export function validUrl(url) {
    url = url || ''
    let isValid = urlRegex.test(url)
    return isValid
}

export function validEmail(email) {
    email = email || ''
    let isValid = emailRegex.test(email)
    return isValid
}
