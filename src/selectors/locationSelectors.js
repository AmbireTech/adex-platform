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

export const selectDashboardBreadcrumbs = createSelector(
	selectLocation,
	({ pathname = '' }) => {
		const paths = pathname.split('/').filter(x => !!x)

		// TODO: validate and use item titles
		const sideDashboard = paths.slice(0, 2)
		const sideDashboardBC = {
			to: `/${sideDashboard.join('/')}`,
			label: 'dashboard',
		}

		const rest = paths.slice(2)

		const restBC = rest.map((x, index) => ({
			to: `${sideDashboardBC.to}/${rest.slice(0, index + 1).join('/')}`,
			label: x,
		}))

		const breadcrumbs = [sideDashboardBC, ...restBC]

		return breadcrumbs || []
	}
)
