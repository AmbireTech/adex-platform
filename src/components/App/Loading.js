import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { LinearProgress, Box } from '@material-ui/core'
import AdexIconTxt from 'resources/adex-logo-txt-sm.svg'
import AdexIconTxtDark from 'resources/adex-logo-txt-dark-theme.svg'
import Media from 'components/common/media'

export default function Loading() {
	const theme = useTheme()

	const AdxIcon = theme.type === 'dark' ? AdexIconTxtDark : AdexIconTxt
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
				<Media src={AdxIcon} style={{ width: 200, height: 'auto' }} />
			</Box>
			<Box width={200}>
				<LinearProgress color='secondary' />
			</Box>
		</Box>
	)
}
