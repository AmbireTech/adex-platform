import { createCachedSelector } from 're-reselect'

export const selectValidations = state => state.memory.validations

export const selectValidationsById = createCachedSelector(
	selectValidations,
	(_, id) => id,
	(validations, id) => validations[id]
)((_state, id = '-') => id)

export const selectMultipleValidationsByIds = createCachedSelector(
	selectValidations,
	(_, ids) => ids,
	(validations, ids) => ids.map(id => validations[id])
)((_state, id = '-') => id)
