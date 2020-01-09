import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const useStyles = makeStyles(styles)

export function AddrItem({ stats }) {
	const { balanceEth, tokensBalances, address } = stats
	const classes = useStyles()

	return (
		<ListItemText
			primary={address}
			secondary={
				<span className={classes.addrInfo}>
					<span>
						<span> ETH </span>
						<strong> {balanceEth} </strong>
					</span>
					{tokensBalances.map(({ symbol, balance }) => (
						<span>
							<span> {symbol} </span>
							<strong> {balance} </strong>
						</span>
					))}
				</span>
			}
		/>
	)
}
