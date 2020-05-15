import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Paper, Box } from '@material-ui/core'
import { t, selectAuthSig } from 'selectors'
import { signatureToBtcWallet } from 'services/jellyswap'

function TopUpBtc(props) {
	const authSig = useSelector(selectAuthSig)
	const [wallet, setWallet] = useState(null)
	const [btcAddress, setBtcAddress] = useState(null)
	const [btcBalance, setBtcBalance] = useState(null)

	useEffect(() => {
		const updateDat = async () => {
			const userBtcWallet = signatureToBtcWallet(authSig)
			setWallet(userBtcWallet)
			const addr = await userBtcWallet.getAddress(1)
			setBtcAddress(addr)
			setBtcBalance(await userBtcWallet.getBalance())

			console.log('wallet', userBtcWallet)
		}
		if (authSig) {
			updateDat()
		}
	}, [authSig])

	return (
		<Paper variant='outlined'>
			<Box p={1}>{'Btc addr: ' + btcAddress}</Box>
			<Box p={1}>{'Btc balance:' + btcBalance}</Box>
			<Box p={1}>{'Btc balance:' + btcBalance}</Box>
		</Paper>
	)
}

export default TopUpBtc
