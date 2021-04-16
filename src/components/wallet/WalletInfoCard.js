import React from 'react'
import PropTypes from 'prop-types'
import { Box, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

export const InfoCard = props => {
	const { title, titleIcon, children } = props

	return (
		<Paper elevation={0} style={{ height: '100%' }}>
			<Box p={3} height={1}>
				<Box mb={2}>
					{titleIcon}
					{title}
				</Box>
				<Box>{children}</Box>
			</Box>
		</Paper>
	)
}
