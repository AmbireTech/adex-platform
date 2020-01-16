import React, { useState, useEffect } from 'react'
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
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles.js'

const EnsAddress = props => {
	const { address } = props
	const [name, setName] = useState()
	const [searching, setSearching] = useState(true)
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	useEffect(() => {
		if (!address) return false
		if (isEthAddress(address)) {
			fetchName(address)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
		<Box display='flex' flexWrap={'nowrap'} alignItems='center'>
			<Box pr={1}>
				<Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
			</Box>
			<Box>
				<ListItemText
					className={classes.address}
					primary={name ? name : address}
					secondary={
						searching ? t('SEARCHING_ENS') : name ? address : t('ENS_NOT_SET')
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
