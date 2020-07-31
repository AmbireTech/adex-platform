import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Paper, Box, Button } from '@material-ui/core'
import { selectAccountIdentityAddr } from 'selectors'
import transakSDK from '@transak/transak-sdk'

function TopUpTransak(props) {
	const identityAddr = useSelector(selectAccountIdentityAddr)

	const openTransak = useCallback(() => {
		const transak = new transakSDK({
			apiKey: '4fcd6904-706b-4aff-bd9d-77422813bbb7', // Your API Key
			environment: 'STAGING', // STAGING/PRODUCTION
			defaultCryptoCurrency: 'DAI',
			walletAddress: identityAddr, // Your customer's wallet address
			themeColor: '000000', // App theme color
			fiatCurrency: 'GBP', // INR/GBP
			email: '', // Your customer's email address
			redirectURL: '',
			hostURL: window.location.origin,
			widgetHeight: '420px',
			widgetWidth: '420px',
		})

		transak.init()

		// To get all the events
		transak.on(transak.ALL_EVENTS, data => {
			console.log(data)
		})

		// This will trigger when the user marks payment is made.
		transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, orderData => {
			console.log(orderData)
			transak.close()
		})
	}, [identityAddr])

	return (
		<Paper variant='outlined'>
			<Button onClick={openTransak}>TopUpTransak</Button>
		</Paper>
	)
}

export default TopUpTransak
