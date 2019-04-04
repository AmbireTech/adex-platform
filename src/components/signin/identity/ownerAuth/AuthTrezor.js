import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import scActions from 'services/smart-contracts/actions'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import TREZOR_DL_IMG from 'resources/trezor-logo-h.png'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'

class AuthTrezor extends Component {
	constructor(props) {
		super(props)
		this.state = {
			method: '',
			sideSelect: false,
			addresses: [],
			waitingTrezorAction: false,
			waitingAddrsData: false,
			selectedAddress: null,
			hdPath: ''
		}
	}

	connectTrezor = async () => {

		this.setState({ waitingTrezorAction: true }, async () => {
			try {
				const { provider } = await getEthers(AUTH_TYPES.TREZOR.name)
				const account = {
					_wallet: {
						authType: AUTH_TYPES.TREZOR.name
					}
				}

				const trezorSigner = await getSigner({ provider, account })

				const addresses = await trezorSigner.getAddresses({ from: 0, to: 19 })

				const allAddressesData = addresses.payload.map((address) =>
					getAddressBalances({ address, authType: AUTH_TYPES.TREZOR.name })
				)

				this.setState({ waitingAddrsData: true }, async () => {
					const results = await Promise.all(allAddressesData)

					console.log('result', results)
					this.setState({
						hdPath: trezorSigner.path,
						addresses: results,
						waitingAddrsData: false,
						waitingTrezorAction: false
					})
				})

			} catch (err) {
				console.error('Error: catch', err)
				this.setState({ waitingTrezorAction: false, waitingAddrsData: false })
				this.props.actions.addToast({
					type: 'cancel',
					action: 'X',
					label: this.props.t(
						'ERR_AUTH_TREZOR',
						{
							args: [Helper.getErrMsg(err)]
						}),
					timeout: 5000
				})
			}
		})
	}

	AddressSelect = ({ addresses, waitingTrezorAction, t, classes, ...rest }) => {
		return (
			<ContentBox
				className={classes.tabBox}
			>
				<ContentStickyTop>
					{waitingTrezorAction ?
						<TopLoading msg={t('TREZOR_WAITING_ACTION')} />
						:
						t('SELECT_ADDR_TREZOR')
					}
				</ContentStickyTop>
				<ContentBody>
					<List >
						{addresses.map((res, index) =>
							<ListItem
								classes={{ root: classes.addrListItem }}
								key={res.address}
								onClick={() => this.onAddrSelect(res, index)}
								selected={this.state.selectedAddress === res.address}
							>
								<AddrItem stats={res} t={t} address={res.address} />
							</ListItem>
						)}
					</List>
				</ContentBody>
			</ContentBox>
		)
	}

	onAddrSelect = (addrData, hdWalletAddrIdx) => {
		const {
			address,
			path,
			balanceEth,
			balanceDai,
		} = addrData
		this.props.updateWallet({
			address,
			authType: AUTH_TYPES.TREZOR.name,
			path,
			balanceEth,
			balanceDai,
			hdWalletAddrPath: this.state.hdPath,
			hdWalletAddrIdx,
			signType: AUTH_TYPES.TREZOR.signType
		})

		this.setState({ selectedAddress: address })
	}

	render() {
		let { t, classes } = this.props

		return (
			<div>
				{this.state.addresses.length ?
					<this.AddressSelect
						waitingTrezorAction={this.state.waitingTrezorAction}
						addresses={this.state.addresses}
						t={t}
						classes={classes}
					/>
					:
					<ContentBox
						className={classes.tabBox}
					>
						{this.state.waitingAddrsData ?
							<ContentStickyTop>
								<TopLoading msg={t('TREZOR_WAITING_ADDRS_INFO')} />
							</ContentStickyTop>
							:
							this.state.waitingTrezorAction ?
								<ContentStickyTop>
									<TopLoading msg={t('TREZOR_WAITING_ACTION')} />
								</ContentStickyTop> : null
						}

						<ContentBody>
							<Typography paragraph variant='subheading'>
								{t('TREZOR_INFO')}
							</Typography>
							<Typography paragraph>
								<span
									dangerouslySetInnerHTML={
										{
											__html: t('TREZOR_BASIC_USAGE_INFO',
												{
													args: [{
														component:
															<Anchor
																href='https://trezor.io/'
																target='_blank'
															>
																TREZOR Wallet
															 </Anchor>
													}, {
														component:
															<Anchor
																href='https://wallet.trezor.io/#/bridge'
																target='_blank'
															>
																TREZOR Bridge
															    </Anchor>
													}]
												})
										}
									}
								/>
							</Typography>
							<Typography paragraph>
								<Anchor href='https://trezor.io' target='_blank'>
									<Img
										src={TREZOR_DL_IMG}
										alt={'https://trezor.io'}
										className={classes.dlBtnImg}
									/>
								</Anchor>
							</Typography>

							{(!this.state.waitingAddrsData && !this.state.waitingTrezorAction) &&
								<Button
									onClick={this.connectTrezor}
									variant='raised'
									color='primary'
								>
									{t('CONNECT_WITH_TREZOR')}
								</Button>
							}

						</ContentBody>
					</ContentBox>
				}
			</div>
		)
	}
}

AuthTrezor.propTypes = {
	actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	const { persist } = state
	const { account } = persist
	return {
		account
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(AuthHoc(withStyles(styles)(AuthTrezor))))