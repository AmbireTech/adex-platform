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
		dirty =>
			execute(validateAndUpdateFn({ item, validateId, dirty, dirtyProps })),
		[dirtyProps, item, validateAndUpdateFn, validateId]
	)

	const save = useCallback(() => {
		execute(
			validateAndUpdateFn({
				item,
				validateId,
				dirty: true,
				update: true,
				dirtyProps,
			})
		)
		setDirtyProps([])
		setFields({})
	}, [dirtyProps, item, validateAndUpdateFn, validateId])

	const returnPropToInitialState = useCallback(
		prop => {
			const newItem = new objModel(item)
			const dirtyIndex = dirtyProps.findIndex(
				p => (p.name || p) === (prop.name || prop)
			)

			if (dirtyIndex > -1) {
				const newDirtyProps = [...dirtyProps]
				const dpValue = newDirtyProps[dirtyIndex]
				newDirtyProps.splice(dirtyIndex, 1)

				if (dpValue.fields) {
					dpValue.fields.forEach(
						prop => (newItem[prop] = initialItemState[prop])
					)
				} else {
					newItem[dpValue] = initialItemState[prop]
				}

				setItem(newItem)
				setDirtyProps(newDirtyProps)
				setActiveFields(prop.name || prop, false)
				validate(false)
			}
		},
		[dirtyProps, initialItemState, item, objModel, setActiveFields, validate]
	)

	const updateField = useCallback(
		(field, value, dpValue) => {
			const newItem = new objModel(item)
			newItem[field] = value

			setItem(newItem)

			const dp = dirtyProps.slice(0)

			if (!dp.some(p => (p.name || p) === (dpValue ? dpValue.name : field))) {
				dp.push(field)
			}
			setDirtyProps(dp)
		},
		[dirtyProps, item, objModel]
	)

	const updateMultipleFields = useCallback(
		(newValues, dirtyFields = []) => {
			const updated = Base.updateObject({ item, newValues, objModel })

			setItem(new objModel(updated))

			const dp = dirtyProps.slice(0)
			dirtyFields.forEach(field => {
				if (!dp.some(p => (p.name || p) === (field.name || field))) {
					dp.push(field)
				}
			})
			setDirtyProps(dp)
		},
		[dirtyProps, item, objModel]
	)

	return {
		item,
		initialItemState,
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
