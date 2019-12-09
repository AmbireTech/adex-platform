import { createSelector } from 'reselect'

export const selectValidations = state => state.memory.validations

export const selectValidationsById = createSelector(
	[selectValidations, (_, id) => id],
	(validations, id) => validations[id]
)
