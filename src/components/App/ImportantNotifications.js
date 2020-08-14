import React from 'react'
import { Box } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
// import { makeStyles } from '@material-ui/core/styles'
// import { styles } from './styles'

export function ImportantNotifications({
	severity = 'info',
	message = null,
	btn = null,
}) {
	return (
		<Box
			style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}
		>
			<Alert variant='filled' severity={severity} style={{ flex: 1 }}>
				<Box display='flex' flexDirection='row' alignItems='center'>
					{message && (
						<Box my={1} mr={1}>
							{message}
						</Box>
					)}
					{btn && (
						<Box my={1} mr={1}>
							{btn}
						</Box>
					)}
				</Box>
			</Alert>
		</Box>
	)
}
