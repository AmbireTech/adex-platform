import React, { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Box from '@material-ui/core/Box'
import ListItemText from '@material-ui/core/ListItemText'
import { isEthAddress } from 'helpers/validators'
import { t } from 'selectors'
import CopyIcon from '@material-ui/icons/FileCopy'
import IconButton from '@material-ui/core/IconButton'
import copy from 'copy-to-clipboard'
import { addToast, execute } from 'actions'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles.js'
import { fetchName } from 'helpers/ensHelper'
import { LoadingSection } from 'components/common/spinners'

const EnsAddressResolver = memo(props => {
	const { address, name } = props
	const [ensName, setEnsName] = useState(name)
	const [searching, setSearching] = useState()
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	useEffect(() => {
		setSearching(true)
		async function resolveENS() {
			if (ensName) {
				setSearching(false)
			} else {
				if (!address) return false
				if (!ensName && isEthAddress(address)) {
					setEnsName(await fetchName(address))
					setSearching(false)
				}
			}
		}
		resolveENS()
	}, [address, ensName])

	return (
		<LoadingSection loading={!address}>
			{address && (
				<Box display='flex' flexWrap={'nowrap'} alignItems='center'>
					<Box pr={1}>
						<Jazzicon diameter={30} seed={jsNumberForAddress(address)} />
					</Box>
					<Box>
						<ListItemText
							className={classes.address}
							primary={ensName ? ensName : address}
							secondary={
								searching
									? t('SEARCHING_ENS')
									: ensName
									? address
									: t('ENS_NOT_SET')
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
			)}
		</LoadingSection>
	)
})

EnsAddressResolver.propTypes = {
	address: PropTypes.string.isRequired,
}

export default EnsAddressResolver
