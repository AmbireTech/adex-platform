import slug from 'slug'
import unidecode from 'unidecode'

const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/

export function validateUrl(url) {
    let isValid = urlRegex.test(url)
    return isValid
}

