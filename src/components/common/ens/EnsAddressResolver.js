import React, { useState, useEffect, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Box from '@material-ui/core/Box'
import ListItemText from '@material-ui/core/ListItemText'
import { ethers } from 'ethers'
import { isEthAddress } from 'helpers/validators'
import { t } from 'selectors'
import CopyIcon from '@material-ui/icons/FileCopy'
import IconButton from '@material-ui/core/IconButton'
import copy from 'copy-to-clipboard'
import { addToast, execute } from 'actions'
import { formatAddress } from 'helpers/formatters'

function useWindowSize() {
	const [size, setSize] = useState([0, 0])
	useLayoutEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight])
		}
		window.addEventListener('resize', updateSize)
		updateSize()
		return () => window.removeEventListener('resize', updateSize)
	}, [])
	return size
}

const FORMAT_BREAKPOINT = 500
const EnsAddress = props => {
	const { address } = props
	const [width, height] = useWindowSize()
	const [justifyContent, setJustifyContent] = useState()
	const [idAddress, setIdAddress] = useState(address)
	const [name, setName] = useState()
	const [searching, setSearching] = useState(true)

	useEffect(() => {
		if (!address) return false
		if (isEthAddress(address)) {
			fetchName(address)
		}
	}, [address])

	useEffect(() => {
		if (width < FORMAT_BREAKPOINT) {
			setIdAddress(formatAddress(address))
			setJustifyContent('space-between')
		} else {
			setIdAddress(address)
			setJustifyContent(false)
		}
	}, [address, width])

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
		<Box
			display='flex'
			flexWrap={'nowrap'}
			alignItems='center'
			justifyContent={justifyContent}
		>
			<Box pr={1}>
				<Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
			</Box>
			<Box>
				<ListItemText
					primary={name ? name : idAddress}
					secondary={
						searching ? t('SEARCHING_ENS') : name ? idAddress : t('ENS_NOT_SET')
					}
				/>
			</Box>
			<Box pl={2}>
				<IconButton
					color='primary'
					onClick={() => {
						copy(address)
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
		</Box>
	)
}

EnsAddress.propTypes = {
	address: PropTypes.string.isRequired,
}

export default EnsAddress
