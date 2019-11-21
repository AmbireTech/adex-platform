import React from 'react'
import { LinearProgress, Box, CircularProgress } from '@material-ui/core'

export const InputLoading = ({ className, color = 'primary' }) => (
	<LinearProgress className={className} color={color} />
)

export const LoadingSection = ({ loading, children }) => (
	<Box display='flex' flex='1' alignItems='center'>
		<Box>{children}</Box>
		<Box ml={2} mr={2}>
			{loading && <CircularProgress />}
		</Box>
	</Box>
)
