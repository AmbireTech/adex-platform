import { createSelector } from 'reselect'

export const getProject = state => state.persist.project

export const selectProject = createSelector(
	[getProject],
	project => project
)
