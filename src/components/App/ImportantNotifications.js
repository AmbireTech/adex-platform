import React from 'react'
import { Box } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'

export function ImportantNotifications({
	severity = 'info',
	message = null,
	title = null,
	action = null,
}) {
	return (
		<Box
			style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}
		>
			<Alert
				variant='filled'
				severity={severity}
				style={{ flex: 1 }}
				action={action}
			>
				{title && <AlertTitle>{title}</AlertTitle>}
				{message}
			</Alert>
		</Box>
	)
}
