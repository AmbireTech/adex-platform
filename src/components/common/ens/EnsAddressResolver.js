import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Box from '@material-ui/core/Box'
import ListItemText from '@material-ui/core/ListItemText'
import { ethers } from 'ethers'
import { isEthAddress } from 'helpers/validators'
import { t } from 'selectors'

const EnsAddress = props => {
	const { address } = props
	const [name, setName] = useState()
	const [searching, setSearching] = useState(true)
	useEffect(() => {
		if (!address) return false
		if (isEthAddress(address)) {
			fetchName(address)
		}
	}, [address])

	const fetchName = lookup => {
		const provider = ethers.getDefaultProvider()
		try {
			setSearching(true)
			provider.lookupAddress(lookup).then(name => {
				setName(name)
				setSearching(false)
			})
		} catch (err) {
			console.error(err)
		}
	}

	return (
		<Box display='flex' flexWrap='wrap' alignItems='center'>
			<Box pr={1}>
				<Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
			</Box>
			<Box>
				<ListItemText
					primary={name ? name : address}
					secondary={
						searching ? t('SEARCHING_ENS') : name ? address : t('ENS_NOT_SET')
					}
				/>
			</Box>
		</Box>
	)
}

EnsAddress.propTypes = {
	address: PropTypes.string.isRequired,
}

export default EnsAddress
