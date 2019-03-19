// import configureStore from 'store/configureStore'
import actions from 'actions'
import { items as ItemsConstants } from 'adex-constants'
import { getItems } from 'services/adex-node/actions'
import { Models } from 'adex-models'
const { ItemsTypes } = ItemsConstants

export const getUserItems = ({ authSig }) => {
	let all = []
	Object.keys(ItemsTypes)
		.forEach((key) => {
			const type = ItemsTypes[key].id
			const p = getItems({ type: type, authSig: authSig })
				.then((items) => {
					items = items.map((item) => {
						let mapped = { ...(new Models.itemClassByTypeId[item._type || item._meta.type](item)) }
						return mapped
					})
					actions.execute(actions.updateItems({ items: items, itemsType: type }))

					return true
				})

			all.push(p)
		})

	return Promise.all(all)
}