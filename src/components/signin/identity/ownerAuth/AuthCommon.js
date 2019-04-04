import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { utils } from 'ethers'

export const addrItem = ({ stats, t, classes }) => {
	const { balanceEth, balanceDai, address } = stats

	return (
		<ListItemText
			primary={address}
			secondary={
				<span className={classes.addrInfo}>
					<span>
						<span> ETH </span>
						<strong> {utils.formatEther(balanceEth)} </strong>
					</span>
					<span>
						<span> DAI </span>
						<strong> {utils.formatEther(balanceDai)} </strong>
					</span>
				</span>
			}
		/>
	)
}

export const AddrItem = withStyles(styles)(addrItem)
