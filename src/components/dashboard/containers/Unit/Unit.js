import React from 'react'

import {
	useItem,
	DirtyProps,
	ItemTitle,
	ItemDescription,
} from 'components/dashboard/containers/ItemHoc/'
import { AdUnit } from 'adex-models'
import TargetsList from 'components/dashboard/containers/TargetsList'

import { BasicProps } from 'components/dashboard/containers/ItemCommon'
import { t } from 'selectors'

function Unit({ match }) {
	const { item, validations, ...hookProps } = useItem({
		itemType: 'AdUnit',
		match,
		objModel: AdUnit,
	})

	const { title, description } = item
	const { title: errTitle, description: errDescription } = validations

	if (!item) return <h1>Unit '404'</h1>

	return (
		<div>
			<DirtyProps {...hookProps} />
			<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
			<ItemDescription
				description={description}
				errDescription={errDescription}
				{...hookProps}
			/>
			<BasicProps
				item={item}
				t={t}
				url={item.adUrl}
				rightComponent={
					<TargetsList
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
