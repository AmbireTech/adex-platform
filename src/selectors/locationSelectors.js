import { createSelector } from 'reselect'

export const selectLocation = state => state.router.location

export const selectSearch = createSelector(
	selectLocation,
	({ search }) => search
)

export const selectLocationQuery = createSelector(
	selectLocation,
	({ query }) => query || {}
)

export const selectSearchParams = createSelector(
	selectLocation,
	({ search }) => new URLSearchParams(search)
)
