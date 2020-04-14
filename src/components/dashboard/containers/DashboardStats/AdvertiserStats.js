import React, { Fragment, useState } from 'react'
import { Box, Paper } from '@material-ui/core'
import {
	AdvertiserTab,
	AdvertiserTabs,
	AdvertiserAppBar,
} from 'components/styled'
import { BasicStats } from './BasicStats'
import { t } from 'selectors'

export function AdvertiserStats() {
	const [tabIndex, setTabIndex] = useState(0)

	return (
		<Fragment>
			<AdvertiserAppBar position='static'>
				<AdvertiserTabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
				>
					<AdvertiserTab label={t('CHARTS')} />
				</AdvertiserTabs>
			</AdvertiserAppBar>
			<Box my={2}>
				{tabIndex === 0 && (
					<Paper>
						<Paper elevation={2}>
							<Box p={1}>
								<BasicStats side='advertiser' />
							</Box>
						</Paper>
					</Paper>
				)}
			</Box>
		</Fragment>
	)
}
