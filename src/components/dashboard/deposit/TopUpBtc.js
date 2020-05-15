import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Paper, Box } from '@material-ui/core'
import { t, selectAuthSig } from 'selectors'
import { signatureToBtcWallet } from 'services/jellyswap'

function TopUpBtc(props) {
	const authSig = useSelector(selectAuthSig)
	const [wallet, setWallet] = useState({})

	useEffect(() => {
		if (authSig) {
			const userBtcWallet = signatureToBtcWallet(authSig)
			setWallet(userBtcWallet)
		}
	}, [authSig])

	return (
		<Paper variant='outlined'>
			<Box p={1}> {wallet.mnemonic}</Box>
		</Paper>
	)
}

export default TopUpBtc
