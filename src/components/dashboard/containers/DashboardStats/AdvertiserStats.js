import React, { Fragment, useState } from 'react'
import { Box, Tabs, Tab } from '@material-ui/core'
import { BasicStats } from './BasicStats'
import {
	ItemTabsBar,
	ItemTabsContainer,
} from 'components/dashboard/containers/ItemCommon/'
import { t } from 'selectors'

export function AdvertiserStats() {
	const [tabIndex, setTabIndex] = useState(0)

	return (
		<Fragment>
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('CHARTS')} />
				</Tabs>
			</ItemTabsBar>
			<ItemTabsContainer>
				{tabIndex === 0 && (
					<Box p={1}>
						<BasicStats side='advertiser' />
					</Box>
				)}
			</ItemTabsContainer>
		</Fragment>
	)
}
