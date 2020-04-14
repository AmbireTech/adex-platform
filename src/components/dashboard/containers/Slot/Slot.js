import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { AdSlot } from 'adex-models'
import { Box } from '@material-ui/core'
import { PublisherTab, PublisherTabs, PublisherAppBar } from 'components/styled'
import { useItem, SaveBtn } from 'components/dashboard/containers/ItemCommon/'
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
			<SaveBtn {...hookProps} />
			<PublisherAppBar position='static'>
				<PublisherTabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<PublisherTab label={t('SLOT_MAIN')} />
					<PublisherTab label={t('INTEGRATION')} />
					{/* There are no stats displayed currently so I will just comment this out */}
					{/* <Tab label={t('STATISTICS')} /> */}
				</PublisherTabs>
			</PublisherAppBar>
			<Box my={2}>
				{tabIndex === 0 && <SlotBasic item={item} {...hookProps} />}
				{tabIndex === 1 && <IntegrationCode slot={item} />}
			</Box>
		</Fragment>
	)
}

Slot.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Slot
