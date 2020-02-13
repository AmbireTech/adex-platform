import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Translate from 'components/translate/Translate'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'
import AuthHoc from './AuthHoc'
import Helper from 'helpers/miscHelpers'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading,
} from 'components/common/dialog/content'
import LEDGER_DL_IMG from 'resources/ledger_logo_header.png'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'

class AuthLedger extends Component {
	constructor(props) {
		super(props)
		this.state = {
			method: '',
			sideSelect: false,
			addresses: [],
			waitingLedgerAction: false,
			waitingAddrsData: false,
			selectedAddress: null,
			hdPath: '',
		}
	}

	connectLedger = async () => {
		this.setState({ waitingLedgerAction: true }, async () => {
			try {
				const { provider } = await getEthers(AUTH_TYPES.LEDGER.name)

				const wallet = {
					authType: AUTH_TYPES.LEDGER.name,
				}

				const ledgerSigner = await getSigner({ wallet, provider })
				const addresses = await ledgerSigner.getAddresses({ from: 0, to: 19 })

				const allAddressesData = addresses.map(address =>
					getAddressBalances({ address, authType: AUTH_TYPES.LEDGER.name })
				)

				this.setState({ waitingAddrsData: true }, async () => {
					const results = await Promise.all(allAddressesData)

					this.setState({
						hdPath: ledgerSigner.path,
						addresses: results,
						waitingAddrsData: false,
						waitingLedgerAction: false,
					})
				})
			} catch (err) {
				console.error('Error: catch', err)
				this.setState({ waitingLedgerAction: false, waitingAddrsData: false })
				this.props.actions.addToast({
					type: 'cancel',
					label: this.props.t('ERR_AUTH_LEDGER', {
						args: [Helper.getErrMsg(err)],
					}),
					timeout: 5000,
				})
			}
		})
	}

	AddressSelect = ({ addresses, waitingLedgerAction, t, classes, ...rest }) => {
		return (
			<ContentBox className={classes.tabBox}>
				<ContentStickyTop>
					{waitingLedgerAction ? (
						<TopLoading msg={t('LEDGER_WAITING_ACTION')} />
					) : (
						t('SELECT_ADDR_LEDGER')
					)}
				</ContentStickyTop>
				<ContentBody>
					<List>
						{addresses.map((res, index) => (
							<ListItem
								classes={{ root: classes.addrListItem }}
								key={res.address}
								onClick={() => this.onAddrSelect(res, index)}
								selected={this.state.selectedAddress === res.address}
							>
								<AddrItem stats={res} t={t} />
							</ListItem>
						))}
					</List>
				</ContentBody>
			</ContentBox>
		)
	}

	onAddrSelect = (addrData, hdWalletAddrIdx) => {
		const { address, path } = addrData

		this.props.updateWallet({
			address,
			authType: AUTH_TYPES.LEDGER.name,
			path,
			hdWalletAddrPath: this.state.hdPath,
			hdWalletAddrIdx,
			signType: AUTH_TYPES.LEDGER.signType,
		})

		this.setState({ selectedAddress: address })
	}

	render() {
		let { t, classes } = this.props

		return (
			<div>
				{this.state.addresses.length ? (
					<this.AddressSelect
						waitingLedgerAction={this.state.waitingLedgerAction}
						addresses={this.state.addresses}
						t={t}
						classes={classes}
					/>
				) : (
					<ContentBox className={classes.tabBox}>
						{this.state.waitingAddrsData ? (
							<ContentStickyTop>
								<TopLoading msg={t('LEDGER_WAITING_ADDRS_INFO')} />
							</ContentStickyTop>
						) : this.state.waitingLedgerAction ? (
							<ContentStickyTop>
								<TopLoading msg={t('LEDGER_WAITING_ACTION')} />
							</ContentStickyTop>
						) : null}

						<ContentBody>
							<Typography variant='subtitle1'>{t('LEDGER_INFO')}</Typography>
							<Typography>
								<span
									dangerouslySetInnerHTML={{
										__html: t('LEDGER_BASIC_USAGE_INFO', {
											args: [
												{
													component: (
														<Anchor
															href='https://www.ledgerwallet.com/'
															target='_blank'
														>
															LEDGER
														</Anchor>
													),
												},
											],
										}),
									}}
								/>
							</Typography>
							<Anchor href='https://www.ledgerwallet.com/' target='_blank'>
								<Img
									src={LEDGER_DL_IMG}
									alt={'https://www.ledgerwallet.com/'}
									className={classes.dlBtnImg}
								/>
							</Anchor>

							{!this.state.waitingAddrsData && !this.state.waitingLedgerAction && (
								<Button
									onClick={this.connectLedger}
									variant='contained'
									color='primary'
								>
									{t('CONNECT_WITH_LEDGER')}
								</Button>
							)}
						</ContentBody>
					</ContentBox>
				)}
			</div>
		)
	}
}

AuthLedger.propTypes = {
	actions: PropTypes.object.isRequired,
	updateWallet: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	classes: PropTypes.object.isRequired,
}

export default Translate(AuthHoc(withStyles(styles)(AuthLedger)))
