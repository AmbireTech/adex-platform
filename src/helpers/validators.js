// TODO: check the regex
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const onlyDigitsRegex = /^([1-9]+\d*)$/


export const validUrl = (url) => {
    url = url || ''
    let isValid = urlRegex.test(url)
    return isValid
}

export const validEmail = (email) => {
    email = email || ''
    let isValid = emailRegex.test(email)
    return isValid
}

export const validateNumber = (numberStr) => {
    numberStr = numberStr || ''
    let isValid = !isNaN(parseFloat(numberStr)) && isFinite(numberStr) && (numberStr > 0)
    return isValid
}

// > 0
export const validPositiveInt = (intStr) => {
    intStr = intStr || ''
    let isValid = onlyDigitsRegex.test(intStr)
    return isValid
}
