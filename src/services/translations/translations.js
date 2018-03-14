import adexTranslations from 'adex-translations'

const translations = adexTranslations()

const interpolate = (tpl, args) => {
    return tpl.replace(/\${(\w+)}/g, function (_, v) { return args[v] })
}

export const translate = (val, { isProp = false, args = [] } = {}, language) => {
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