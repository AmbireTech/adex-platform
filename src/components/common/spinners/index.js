import React from 'react'
import { LinearProgress, Box, CircularProgress } from '@material-ui/core'

export const InputLoading = ({ msg, className }) => (
	<>
		<LinearProgress className={className} />
		{msg ? <div> {msg} </div> : null}
	</>
)

export const LoadingSection = ({ loading, children }) => (
	<Box display='flex' alignItems='center'>
		<Box>{children}</Box>
		<Box ml={2} mr={2}>
			{loading && <CircularProgress />}
		</Box>
	</Box>
)
