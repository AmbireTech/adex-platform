import React from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading,
} from 'components/common/dialog/content'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { selectWalletAddress, execute } from 'actions'

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

export const AddressSelect = ({
	addresses,
	address,
	waitingAction,
	actionWaitingLabel,
	selectLabel,
	signType,
	authType,
	hdWalletAddrPath,
	classes,
}) => {
	return (
		<ContentBox>
			<ContentStickyTop>
				{waitingAction ? <TopLoading msg={actionWaitingLabel} /> : selectLabel}
			</ContentStickyTop>
			<ContentBody>
				<List>
					{addresses.map((addrData, hdWalletAddrIdx) => (
						<ListItem
							classes={{ root: classes.addrListItem }}
							key={addrData.address}
							onClick={() =>
								execute(
									selectWalletAddress({
										addrData,
										hdWalletAddrPath,
										hdWalletAddrIdx,
										signType,
										authType,
									})
								)
							}
							selected={address === addrData.address}
						>
							<AddrItem stats={addrData} address={addrData.address} />
						</ListItem>
					))}
				</List>
			</ContentBody>
		</ContentBox>
	)
}
