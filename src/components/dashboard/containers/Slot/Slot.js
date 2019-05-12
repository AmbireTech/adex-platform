import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { AdSlot } from 'adex-models'
import copy from 'copy-to-clipboard'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import { BasicProps } from 'components/dashboard/containers/ItemCommon'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import CopyIcon from '@material-ui/icons/FileCopy'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { contracts } from 'services/smart-contracts/contractsCfg'

const { DAI } = contracts

const ADVIEW_URL = process.env.ADVIEW_URL
const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const IntegrationCode = ({ t, account, slot = {}, classes, onCopy }) => {
	const {type, tags, fallbackMediaUrl, fallbackTargetUrl } = slot
	const identityAddr = account.identity.address

	let sizes = type.split('_')[1].split('x')
	sizes = {
		width: sizes[0],
		height: sizes[1]
	}

	const options = {
		publisherAddr: identityAddr,
		whitelistedToken: DAI.address,
		whitelistedType: type,
		randomize: true,
		targeting: tags || [],
		fallbackMediaUrl: fallbackMediaUrl || '',
		fallbackTargetUrl: fallbackTargetUrl || '',
		marketURL: ADEX_MARKET_HOST
	}

	let query = encodeURIComponent(JSON.stringify({options}))

	let src = ADVIEW_URL + query

	let iframeStr =
		`<iframe src="${src}"\n` +
		`   width="${sizes.width}"\n` +
		`   height="${sizes.height}"\n` +
		`   scrolling="no"\n` +
		`   frameBorder="0"\n` +
		`   style="border: 0;"\n` +
		`></iframe>`

	// TODO: Add copy to clipboard and tooltip or description how to use it
	return (
		<div>
			<div className={classes.integrationLabel}>
				{t('INTEGRATION_CODE')}
				<IconButton
					color='default'
					onClick={() => {
						copy(iframeStr)
						onCopy && onCopy()
					}}
				>
					<CopyIcon />
				</IconButton>
			</div>
			<Paper>
				<pre className={classes.integrationCode}>
					{iframeStr}
				</pre>
			</Paper>
			{(process.env.NODE_ENV !== 'production') &&
				<div>
					<br />
					<div className={classes.integrationLabel}> {t('AD_PREVIEW')}</div>
					<div dangerouslySetInnerHTML={{ __html: iframeStr }} />
				</div>
			}
		</div>
	)
}

export class Slot extends Component {

	constructor(props) {
		super(props)
		this.state = {
			editFallbackImg: false
		}
	}

	handleFallbackImgUpdateToggle = () => {
		const active = this.state.editFallbackImg
		this.setState({ editFallbackImg: !active })
	}

	render() {
		const { t, classes, isDemo, item, account, ...rest } = this.props

		if (!item.id) return (<h1>Slot '404'</h1>)

		return (
			<div>
				<BasicProps
					item={item}
					t={t}
					url={item.adUrl}
					canEditImg={!isDemo}
					rightComponent={
						<IntegrationCode
							classes={classes}
							t={t}
							account={account}
							slot={item}	
							onCopy={() =>
								this.props.actions
									.addToast({ type: 'accept', action: 'X', label: t('COPIED_TO_CLIPBOARD'), timeout: 5000 })}
						/>}
				/>
			</div>
		)
	}
}

Slot.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	const { persist } = state
	// let memory = state.memory
	return {
		account: persist.account,
		objModel: AdSlot,
		itemType: 'AdSlot',
		// NOTE: maybe not the best way but pass props to the HOC here
		updateImgInfoLabel: 'SLOT_AVATAR_IMG_INFO',
		updateImgLabel: 'SLOT_AVATAR_IMG_LABEL',
		updateImgErrMsg: 'ERR_IMG_SIZE_MAX',
		updateImgExact: true
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const SlotItem = ItemHoc(withStyles(styles)(Slot))
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SlotItem)
