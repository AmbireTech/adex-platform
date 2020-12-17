import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { LinearProgress, Box } from '@material-ui/core'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import AdexIconTxtDark from 'components/common/icons/AdexIconTxtDark'

export default function Loading() {
	const theme = useTheme()

	const AdxIcon = theme.type === 'dark' ? AdexIconTxt : AdexIconTxtDark

	return (
		<Box
			display='flex'
			width='100vw'
			height='100vh'
			flexDirection='column'
			justifyContent='center'
			alignItems='center'
			position='absolute'
		>
			<Box mb={1}>
				<AdxIcon style={{ width: 200, height: 'auto' }} />
			</Box>
			<Box width={200}>
				<LinearProgress color='secondary' />
			</Box>
		</Box>
	)
}
