import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { AdSlot } from 'adex-models'
import { Tabs, Tab } from '@material-ui/core'
import {
	useItem,
	ChangeControls,
	ItemTabsBar,
	ItemTabsContainer,
} from 'components/dashboard/containers/ItemCommon/'
import { SlotBasic } from './SlotBasic'
import { IntegrationCode } from './IntegrationCode'
import { validateAndUpdateSlot } from 'actions'
import { t } from 'selectors'

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
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('SLOT_MAIN')} />
					<Tab label={t('INTEGRATION')} />
					{/* There are no stats displayed currently so I will just comment this out */}
					{/* <Tab label={t('STATISTICS')} /> */}
				</Tabs>
			</ItemTabsBar>
			<ChangeControls {...hookProps} />
			<ItemTabsContainer>
				{tabIndex === 0 && <SlotBasic item={item} {...hookProps} />}
				{tabIndex === 1 && <IntegrationCode slot={item} />}
			</ItemTabsContainer>
		</Fragment>
	)
}

Slot.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Slot
