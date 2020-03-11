import React, { useEffect, Fragment } from 'react'
import { useSelector } from 'react-redux'
import { execute, updateNav } from 'actions'
import { Box, Paper } from '@material-ui/core'
import SideSelect from 'components/signin/side-select/SideSelect'
import { BasicStats } from './BasicStats'
import { t, selectSide } from 'selectors'
import BestEarnersTable from '../Tables/BestEarnersTable'

export function DashboardStats(props) {
	const side = useSelector(selectSide)

	useEffect(() => {
		execute(updateNav('navTitle', t('DASHBOARD')))
	}, [])

	return side !== 'advertiser' && side !== 'publisher' ? (
		<SideSelect active={true} />
	) : (
		<Fragment>
			<Paper elevation={2}>
				<Box p={1}>
					<BasicStats side={side} />
				</Box>
			</Paper>
			{side === 'publisher' && (
				<Box pt={1}>
					<BestEarnersTable />
				</Box>
			)}
		</Fragment>
	)
}

export default DashboardStats
