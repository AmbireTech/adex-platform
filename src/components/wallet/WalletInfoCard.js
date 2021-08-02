import React from 'react'
import { Box, Paper, Typography } from '@material-ui/core'

export const InfoCard = props => {
	const { title, titleIcon, children } = props

	return (
		<Paper elevation={0} style={{ height: '100%' }}>
			<Box p={3} height={1} display='flex' flexDirection='column'>
				<Box mb={2}>
					{titleIcon}
					<Typography variant='h5'>{title}</Typography>
				</Box>
				<Box flexGrow='1'>{children}</Box>
			</Box>
		</Paper>
	)
}
