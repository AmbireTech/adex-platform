import adexTranslations from 'adex-translations'

const translations = adexTranslations()

let lang = 'en-US'

const interpolate = (tpl, args) => {
    return tpl.replace(/\${(\w+)}/g, function (_, v) { return args[v] })
}

export const translate = (val, { isProp = false, args = [] } = {}, language = lang) => {
    let key = val + ''
    if (isProp) {
        key = 'PROP_' + (key.replace(/^_/, ''))
    }
    
    key = key.toUpperCase()

    let translation = translations[language][key] || val

    if(args.length && Array.isArray(args)){
        translation = interpolate(translation, args)
    }

    return translation
}

// TODO: fix that
export const setLang = (lng) => {
    lang = lng
}