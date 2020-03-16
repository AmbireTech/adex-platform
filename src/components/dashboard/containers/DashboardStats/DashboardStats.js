import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper } from '@material-ui/core'
import SideSelect from 'components/signin/side-select/SideSelect'
import { BasicStats } from './BasicStats'
import { selectSide } from 'selectors'

export function DashboardStats(props) {
	const side = useSelector(selectSide)

	return side !== 'advertiser' && side !== 'publisher' ? (
		<SideSelect active={true} />
	) : (
		<Paper elevation={2}>
			<Box p={1}>
				<BasicStats side={side} />
			</Box>
		</Paper>
	)
}

export default DashboardStats
