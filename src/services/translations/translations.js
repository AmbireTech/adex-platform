import adexTranslations from 'adex-translations'
import { removeTags } from 'helpers/sanitizer'

const translations = adexTranslations()

let lang = 'en-US'

const interpolate = (tpl, args) => {
	if (typeof tpl !== 'string') {
		return ''
	}

	const pattern = new RegExp(/\${(\w+)}/, 'gi')
	const parts = tpl.split(pattern)

	const interpolated = parts.map(p => args[p] || p)

	if (interpolated.every(i => typeof i === 'string')) {
		return interpolated.join('')
	}

	return interpolated
}

export const translate = (
	val = '',
	{ isProp = false, args = [''] } = {},
	language = lang
) => {
	let key = val + ''
	if (isProp) {
		key = 'PROP_' + key.replace(/^_/, '')
	}

	key = key.toUpperCase()

	let translation = removeTags(translations[language][key] || val)

	if (args.length && Array.isArray(args)) {
		const translatedArgs = args.map(a => {
			if (typeof a === 'string') {
				return translations[language][a] || a
			} else {
				return a
			}
		})

		translation = interpolate(translation, translatedArgs)
	}

	return translation
}

// TODO: fix that
export const setLang = lng => {
	lang = lng
}
