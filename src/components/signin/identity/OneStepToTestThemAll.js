import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getAuthSig } from 'services/smart-contracts/actions/ethers'
import { openChannel } from 'services/smart-contracts/actions/core'
import {
	getIdentityDeployData,
	deployIdentityContract
} from 'services/smart-contracts/actions/identity'
import { getSession, checkSession } from 'services/adex-market/actions'

// Fast way to test some stuff 

const trezorWallet = {
	address: "0xEf5217967a96272daF66DDf9dbD1828fcE061095",
	authType: "trezor",
	balanceDai: "42000000000000000000",
	balanceEth: "500000000000000000",
	chainId: undefined,
	hdWalletAddrIdx: 0,
	hdWalletAddrPath: "m/44'/60'/0'/0",
	path: "m/44'/60'/0'/0/0",
	signType: 2
}

const ledgerWallet = {
	address: "0x5e2659AFE5971242F3f62C5D1F1e09E1943F9FF3",
	authType: "ledger",
	balanceDai: "42000000000000000000",
	balanceEth: "420000000000000000",
	chainId: undefined,
	hdWalletAddrIdx: 0,
	hdWalletAddrPath: "m/44'/60'/0'",
	path: "m/44'/60'/0'/0",
	signType: 2
}

const metamaskWallet = {
	address: "0x2aecf52abe359820c48986046959b4136afdfbe2",
	authToken: 46,
	authType: "metamask",
	signType: 2
}

const localWallet = {
	address: "0xe03BB9d991FFC0A9d875F9285c9790d36CC233FB",
	mnemonic: "",
	email: "ivo.paunov@gmail.com",
	password: "passWord123",
	authType: "grant",
	signType: 2,
	privateKey: "0xce92319e1eabc076c9298bf9170fc1a06bf821b301c1259083866ef020a4238a"
}

class AllInOneTest extends Component {

	getIdentityContractAddress = async (wallet) => {
		const account = {
			wallet
		}

		const res = await getAuthSig({ account })
	}

	signatureTest = async (wallet) => {
		const res = await getAuthSig({ wallet })

		console.log('res', res)

		await getSession({
			identity: '',
			mode: res.mode,
			signature: res.signature,
			authToken: res.authToken,
			hash: res.hash,
			signerAddress: res.address
		})
	}

	channelTest = async (wallet) => {
		const result = await openChannel({ wallet })
	}

	identityTest = async (wallet) => {

		const deployData = await getIdentityDeployData({
			owner: wallet.address,
			privLevel: 3
		})

		const identityTx = await deployIdentityContract({
			wallet,
			...deployData
		})

		console.log('deployData', deployData)
	}

	render() {
		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item xs={12}>
						<Button onClick={() => this.identityTest(ledgerWallet)}>
							{'Identity ledger'}</Button>
						<Button onClick={() => this.identityTest(trezorWallet)}>
							{'Identity trezor'}</Button>
						<Button onClick={() => this.identityTest(metamaskWallet)}>
							{'Identity metamask'}</Button>
						<Button onClick={() => this.identityTest(localWallet)}>
							{'Identity local'}</Button>
					</Grid>
					<Grid item xs={12}>
						<Button onClick={() => this.channelTest(ledgerWallet)}>
							{'Channel ledger'}</Button>
						<Button onClick={() => this.channelTest(trezorWallet)}>
							{'Channel trezor'}</Button>
						<Button onClick={() => this.channelTest(metamaskWallet)}>
							{'Channel metamask'}</Button>
						<Button onClick={() => this.channelTest(localWallet)}>
							{'Channel local'}</Button>
					</Grid>
					<Grid item xs={12}>
						<Button onClick={() => this.signatureTest(ledgerWallet)}>
							{'Signature ledger'}</Button>
						<Button onClick={() => this.signatureTest(trezorWallet)}>
							{'Signature trezor'}</Button>
						<Button onClick={() => this.signatureTest(metamaskWallet)}>
							{'Signature metamask'}</Button>
						<Button onClick={() => this.signatureTest(localWallet)}>
							{'Signature local'}</Button>
					</Grid>
				</Grid>
			</div >
		)
	}
}

AllInOneTest.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	let persist = state.persist
	// let memory = state.memory
	return {
		account: persist.account,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const AllInOneTestStep = IdentityHoc(AllInOneTest)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(AllInOneTestStep)))