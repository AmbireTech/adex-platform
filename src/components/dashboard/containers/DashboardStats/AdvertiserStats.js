import React, { Fragment, useState } from 'react'
import { Box, Paper, Tabs, Tab } from '@material-ui/core'
import { BasicStats } from './BasicStats'
import { t } from 'selectors'

export function AdvertiserStats() {
	const [tabIndex, setTabIndex] = useState(0)

	return (
		<Fragment>
			<Paper variant='outlined'>
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
			</Paper>
			<Box my={1}>
				{tabIndex === 0 && (
					<Paper variant='outlined'>
						<Box p={1}>
							<BasicStats side='advertiser' />
						</Box>
					</Paper>
				)}
			</Box>
		</Fragment>
	)
}
