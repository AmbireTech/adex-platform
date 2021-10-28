import adexTranslations from 'translations'
import { removeTags } from 'helpers/sanitizer'
import { isValidElement, cloneElement } from 'react'

const translations = adexTranslations()

let lang = 'en-US'

const interpolate = (tpl, args) => {
	if (typeof tpl !== 'string') {
		return ''
	}

	const pattern = new RegExp(/\${(\w+)}/, 'gi')
	const parts = tpl.split(pattern)

	const interpolated = parts.map((p, i) => {
		const element = args[p] || p
		if (isValidElement(element) && !element.key) {
			const withKey = cloneElement(element, { key: i })

			return withKey
		}

		return element
	})

	if (interpolated.every(i => typeof i === 'string' || typeof i === 'number')) {
		return interpolated.join('')
	}

	return interpolated
}

export const translate = (
	val = '',
	{ isProp = false, args = [''], toUpperCase = false } = {},
	language = lang
) => {
	let key = val + ''
	if (isProp) {
		key = 'PROP_' + key.replace(/^_/, '')
	}
	if (toUpperCase) {
		key = key.toUpperCase()
	}

	key = key.toUpperCase()

	let translation = removeTags(translations[language][key] || val)

	if (Array.isArray(args)) {
		if (args.length) {
			const translatedArgs = args.map(a => {
				if (typeof a === 'string') {
					return translations[language][a] || a
				} else {
					return a
				}
			})

			translation = interpolate(translation, translatedArgs)
		} else {
			translation = translation.replace(/\${(\w+)}/, ' ')
		}
	}

	return translation
}

// TODO: fix that
export const setLang = lng => {
	lang = lng
}
