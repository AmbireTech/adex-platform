import React from 'react'
import adexTranslations from 'adex-translations'
import { renderToString } from 'react-dom/server'

const translations = adexTranslations()

let lang = 'en-US'

// TODO: sanitization
const interpolate = (tpl, args) => {
	if (typeof tpl !== 'string') {
		return ''
	}

	return tpl.replace(/\${(\w+)}/g, (_, v) => {
		let arg = args[v]
		if (typeof arg === 'object' && !!arg && arg.component) {
			return renderToString(arg.component)
		} else {
			return arg || ''
		}
	})
}

const addComponents = (tpl, components) => {
	let result = [tpl]
	for (let i = 0; i < components.length; i++) {
		const replace = `<${i}>(.*?)</${i}>`
		const regex = new RegExp(replace, 'g')
		while (true) {
			let newResult = []
			for (let r = 0; r < result.length; r++) {
				if (typeof result[r] !== 'string') {
					newResult = [...newResult, result[r]]
					continue
				}
				const parts = result[r].split(regex)
				for (let j = 1; j < parts.length; j += 2) {
					parts[j] = React.cloneElement(
						components[i],
						components[i].props,
						parts[j]
					)
				}
				newResult = [...newResult, ...parts]
			}
			if (result.length === newResult.length) break
			result = newResult
		}
	}
	return <div>{result}</div>
}

export const translate = (
	val = '',
	{ isProp = false, args = [''], components = [] } = {},
	language = lang
) => {
	let key = val + ''
	if (isProp) {
		key = 'PROP_' + key.replace(/^_/, '')
	}

	key = key.toUpperCase()

	let translation = translations[language][key] || val

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

	if (components.length && Array.isArray(components)) {
		translation = addComponents(translation, components)
	}

	return translation
}

// TODO: fix that
export const setLang = lng => {
	lang = lng
}
