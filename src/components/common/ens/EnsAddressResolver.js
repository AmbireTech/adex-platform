import React, { useState, useEffect, memo } from 'react'
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

export const fetchName = async lookup => {
	const provider = ethers.getDefaultProvider()
	try {
		const name = await provider.lookupAddress(lookup)
		return name
	} catch (err) {
		console.error(err)
		return false
	}
}

const EnsAddress = memo(props => {
	const { address } = props
	const [name, setName] = useState('')
	const [searching, setSearching] = useState(true)
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	useEffect(() => {
		setSearching(true)
		async function resolveName() {
			const resolved = await fetchName(address)
			setName(resolved)
			setSearching(false)
		}
		if (!address) return false
		if (!name && isEthAddress(address)) {
			resolveName()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Box display='flex' flexWrap={'nowrap'} alignItems='center'>
			{address && (
				<Box pr={1}>
					<Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
				</Box>
			)}
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
})

EnsAddress.propTypes = {
	address: PropTypes.string.isRequired,
}

export default EnsAddress
