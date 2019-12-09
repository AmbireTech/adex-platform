import React from 'react'
import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'
import { execute, validate } from 'actions'
import { selectValidationsById } from 'selectors'

export default function NewItemHoc(Decorated) {
	const ValidItemHoc = props => {
		const validations = useSelector(state =>
			selectValidationsById(state, props.validateId)
		)

		const makeValidation = (
			key,
			{ isValid, err = { msg: '', args: [] }, dirty = false, removeAll = false }
		) => {
			const { validateId } = this.props
			execute(validate(key, { isValid, err, dirty, removeAll }, validateId))
		}

		return (
			<Decorated
				{...props}
				validate={makeValidation}
				invalidFields={validations}
			/>
		)
	}

	ValidItemHoc.propTypes = {
		validateId: PropTypes.string.isRequired,
	}

	return ValidItemHoc
}
