import { createSelector } from 'reselect'
import { PROJECTS } from 'constants/global'

export const getProject = state => state.persist.project

export const selectProject = createSelector([getProject], project => project)

export const selectIsPlatform = createSelector(
	[selectProject],
	project => project === PROJECTS.platform
)

export const selectIsWallet = createSelector(
	[selectProject],
	project => project === PROJECTS.wallet
)
