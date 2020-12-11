import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import copy from 'copy-to-clipboard'
import CopyIcon from '@material-ui/icons/FileCopy'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { Paper, IconButton, Box, Typography } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'

import { execute, addToast } from 'actions'

import url from 'url'
import {
	selectRoutineWithdrawTokensAddresses,
	selectHasConfirmedEmail,
	selectAccountIdentityAddr,
	t,
} from 'selectors'

const ADVIEW_URL = process.env.ADVIEW_URL
const adviewUrl = url.parse(ADVIEW_URL)
const origin = `${adviewUrl.protocol}//${adviewUrl.host}`

const AUTO_HIDE_STRING = `window.addEventListener('message', function(ev) { 
		if (ev.data.hasOwnProperty('adexHeight') && ('${origin}' === ev.origin)) {
			for (let f of document.getElementsByTagName('iframe')) {	
				if (f.contentWindow === ev.source) {
					f.height = ev.data.adexHeight;
				}
			}	
		}
	}, false)`

// const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const useStyles = makeStyles(styles)

export const IntegrationCode = ({ slot = {} }) => {
	const classes = useStyles()
	const { id, type, tags, fallbackUnit } = slot
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const isEmailConfirmed = useSelector(selectHasConfirmedEmail)

	let sizes = type.split('_')[1].split('x')
	sizes = {
		width: sizes[0],
		height: sizes[1],
	}

	const options = {
		publisherAddr: identityAddr,
		whitelistedTokens: selectRoutineWithdrawTokensAddresses(),
		whitelistedType: type,
		randomize: true,
		targeting: tags || [],
		// marketURL: ADEX_MARKET_HOST,
		width: sizes.width,
		height: sizes.height,
		minPerImpression: '0',
		// minTargetingScore: '0',
		fallbackUnit,
		marketSlot: id,
	}

	let query = encodeURIComponent(JSON.stringify({ options }))

	let src = ADVIEW_URL + query

	let iframeStr =
		`<iframe\n` +
		`	src="${src}"\n` +
		`	width="${sizes.width}"\n` +
		`	height="${sizes.height}"\n` +
		`	scrolling="no"\n` +
		`	frameborder="0"\n` +
		`	style="border: 0;"\n` +
		`	onload="${AUTO_HIDE_STRING}"\n` +
		`></iframe>`

	// TODO: Add copy to clipboard and tooltip or description how to use it

	// 	<Alert severity='warning' variant='filled'>
	// 	<AlertTitle>{t('EMAIL_NOT_CONFIRMED_WARNING_TITLE')}</AlertTitle>
	// 	<div
	// 		dangerouslySetInnerHTML={{
	// 			__html: t('EMAIL_WARNING_SLOT_INTEGRATION'),
	// 		}}
	// 	/>
	// </Alert>
	return isEmailConfirmed ? (
		<Box overflow='hidden'>
			<Box mb={1}>
				<Paper variant='outlined'>
					<Box
						display='flex'
						flexDirection='row'
						alignItems='center'
						justifyContent='space-between'
						px={1}
					>
						<Typography>{t('INTEGRATION_CODE')}</Typography>
						<IconButton
							color='default'
							onCopy={() =>
								addToast({
									type: 'accept',
									label: t('COPIED_TO_CLIPBOARD'),
									timeout: 5000,
								})
							}
							onClick={() => {
								copy(iframeStr)
								execute(
									addToast({
										type: 'accept',
										label: t('COPIED_TO_CLIPBOARD'),
										timeout: 5000,
									})
								)
							}}
						>
							<CopyIcon />
						</IconButton>
					</Box>
				</Paper>
			</Box>
			<Paper variant='outlined'>
				<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
					<pre className={classes.integrationCode}>{iframeStr}</pre>
				</Box>
			</Paper>
			{process.env.NODE_ENV !== 'production' && (
				<div>
					<br />
					<div className={classes.integrationLabel}> {t('AD_PREVIEW')}</div>
					<div dangerouslySetInnerHTML={{ __html: iframeStr }} />
				</div>
			)}
		</Box>
	) : (
		<Alert severity='warning' variant='filled'>
			<AlertTitle>{t('EMAIL_NOT_CONFIRMED_WARNING_TITLE')}</AlertTitle>
			<div
				dangerouslySetInnerHTML={{
					__html: t('EMAIL_WARNING_SLOT_INTEGRATION'),
				}}
			/>
		</Alert>
	)
}

IntegrationCode.propTypes = {
	slot: PropTypes.object.isRequired,
}
