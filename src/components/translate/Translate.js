import React from 'react'
import { useSelector } from 'react-redux'
import { translate } from 'services/translations/translations'
import { selectLang } from 'selectors'

export default function Translate(Decorated) {
	function Translated(props) {
		const language = useSelector(selectLang)

		const t = (val, { isProp = false, args = [''] } = {}) => {
			const translation = translate(val, { isProp, args }, language)

			return translation
		}

		return <Decorated {...props} t={t} />
	}

	return Translated
}
