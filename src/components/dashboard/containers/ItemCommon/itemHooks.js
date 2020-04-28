import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
	selectItemByTypeAndId,
	selectValidationsById,
	selectSpinnerById,
} from 'selectors'
import { execute } from 'actions'
import { Base } from 'adex-models'

export function useItem({ itemType, match, objModel, validateAndUpdateFn }) {
	const [item, setItem] = useState({})
	const [initialItemState, setInitialItemState] = useState({})
	const [activeFields, setFields] = useState({})
	const [dirtyProps, setDirtyProps] = useState([])
	const [validateId, setValidateId] = useState('update-default')

	const storeItem = useSelector(state =>
		selectItemByTypeAndId(state, itemType, match.params.itemId)
	)

	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const spinner = useSelector(state => selectSpinnerById(state, validateId))

	useEffect(() => {
		const initial = new objModel(storeItem)
		setItem(initial)
		setInitialItemState(initial)
		setValidateId(`update-${item.id}`)
	}, [item.id, objModel, storeItem])

	const setActiveFields = useCallback(
		(field, value) => {
			setFields({ ...activeFields, [field]: value })
		},
		[activeFields]
	)

	const validate = useCallback(
		dirty => execute(validateAndUpdateFn({ item, validateId, dirty })),
		[item, validateAndUpdateFn, validateId]
	)

	const save = useCallback(() => {
		execute(
			validateAndUpdateFn({ item, validateId, dirty: true, update: true })
		)
		setDirtyProps([])
		setFields({})
	}, [item, validateAndUpdateFn, validateId])

	const returnPropToInitialState = useCallback(
		propName => {
			const newItem = new objModel(item)
			newItem[propName] = initialItemState[propName]

			const dp = dirtyProps.filter(dp => {
				return dp !== propName
			})

			setItem(newItem)
			setDirtyProps(dp)
			setActiveFields(propName, false)
			validate(false)
		},
		[dirtyProps, initialItemState, item, objModel, setActiveFields, validate]
	)

	const updateField = useCallback(
		(field, value, skipDp) => {
			const newItem = new objModel(item)
			newItem[field] = value

			setItem(newItem)
			if (!skipDp) {
				const dp = dirtyProps.slice(0)

				if (!dp.includes(field)) {
					dp.push(field)
				}
				setDirtyProps(dp)
			}
		},
		[dirtyProps, item, objModel]
	)

	const updateMultipleFields = useCallback(
		(newValues, dirtyFields = []) => {
			const updated = Base.updateObject({ item, newValues, objModel })

			setItem(new objModel(updated))

			const dp = dirtyProps.slice(0)
			dirtyFields.forEach(field => {
				if (!dp.includes(field)) {
					dp.push(field)
				}
			})
			setDirtyProps(dp)
		},
		[dirtyProps, item, objModel]
	)

	return {
		item,
		activeFields,
		setActiveFields,
		dirtyProps,
		returnPropToInitialState,
		validate,
		validateId,
		validations,
		updateField,
		updateMultipleFields,
		spinner,
		save,
	}
}
