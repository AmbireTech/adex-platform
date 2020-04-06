import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { AdSlot } from 'adex-models'
import { Tab, Tabs, AppBar } from '@material-ui/core'

import { useItem, SaveBtn } from 'components/dashboard/containers/ItemCommon/'
import { validateAndUpdateSlot } from 'actions'

import { t } from 'selectors'

import { SlotBasic } from './SlotBasic'
import { IntegrationCode } from './IntegrationCode'

function Slot({ match }) {
	const [tabIndex, setTabIndex] = useState(0)

	const { item, ...hookProps } = useItem({
		itemType: 'AdSlot',
		match,
		objModel: AdSlot,
		validateAndUpdateFn: validateAndUpdateSlot,
	})

	return (
		<Fragment>
			<SaveBtn {...hookProps} />
			<AppBar position='static' color='default'>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('SLOT_BASIC')} />
					<Tab label={t('INTEGRATION')} />
					{/* There are no stats displayed currently so I will just comment this out */}
					{/* <Tab label={t('STATISTICS')} /> */}
				</Tabs>
			</AppBar>
			<div style={{ marginTop: 10 }}>
				{tabIndex === 0 && <SlotBasic item={item} {...hookProps} />}
				{tabIndex === 1 && <IntegrationCode slot={item} />}
			</div>
		</Fragment>
	)
}

Slot.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Slot
