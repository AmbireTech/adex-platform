import { createSelector } from 'reselect'
import {
	selectCampaignById,
	selectAdUnitById,
	selectAdSlotById,
} from 'selectors'

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

const ITEMS_SELECTORS = {
	campaigns: selectCampaignById,
	receipt: selectCampaignById,
	units: selectAdUnitById,
	slots: selectAdSlotById,
}

export const selectDashboardBreadcrumbs = createSelector(
	[selectLocation, state => state],
	({ pathname = '' }, state) => {
		const paths = pathname.split('/').filter(x => !!x)

		// TODO: validate it starts from dashboard
		const sideDashboard = paths.slice(0, 2)
		const sideDashboardBC = {
			to: `/${sideDashboard.join('/')}`,
			label: 'dashboard',
		}

		const rest = paths.slice(2)

		const restBC = rest.map((x, index) => {
			const prev = rest[index - 1]
			const selector = ITEMS_SELECTORS[prev]

			let label = x

			if (selector) {
				const { title } = selector(state, x) || {}
				label = title || label
			}

			const bc = {
				label,
			}

			if (index < rest.length - 1) {
				const restCopy = [...rest]

				const receiptAt = restCopy.indexOf('receipt')
				// NOTE: go to campaign on receipt breadcrumb
				if (receiptAt >= 0) {
					restCopy[receiptAt] = 'campaigns'
				}

				bc.to = `${sideDashboardBC.to}/${restCopy
					.slice(0, index + 1)
					.join('/')}`
			}

			return bc
		})

		const breadcrumbs = [sideDashboardBC, ...restBC]

		return breadcrumbs || []
	}
)
