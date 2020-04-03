import React from 'react'

import { useItem, DirtyProps } from 'components/dashboard/containers/ItemHoc/'
import { AdUnit } from 'adex-models'
import UnitTargets from 'components/dashboard/containers/UnitTargets'

import { BasicProps } from 'components/dashboard/containers/ItemCommon'
import { t } from 'selectors'

function Unit({ match }) {
	const {
		item,
		activeFields,
		setActiveFields,
		returnPropToInitialState,
	} = useItem({ itemType: 'AdUnit', match, objModel: AdUnit })
	if (!item) return <h1>Unit '404'</h1>

	return (
		<div>
			<DirtyProps
				activeFields={activeFields}
				returnPropToInitialState={returnPropToInitialState}
			/>
			<BasicProps
				item={item}
				t={t}
				url={item.adUrl}
				rightComponent={
					<UnitTargets
						targets={item.targeting}
						t={t}
						subHeader={'PROP_TARGETING'}
					/>
				}
			/>
		</div>
	)
}

export default Unit
