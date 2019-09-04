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
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import AppBar from '@material-ui/core/AppBar'
import url from 'url'

const ADVIEW_URL = process.env.ADVIEW_URL
const adviewUrl = url.parse(ADVIEW_URL)
const origin = `${adviewUrl.protocol}//${adviewUrl.host}`

const AUTO_HIDE_STRING = `window.addEventListener('message', function(ev) { 
		if (ev.data.hasOwnProperty('adexHeight') && ('${origin}' === ev.origin)) {
			for (let f of document.getElementsByTagName('iframe')) {	
				if (f.contentWindow === ev.source) {
					f.height = ev.data.adexHeight;
				}
			}	
		}
	}, false)`

const { DAI } = contracts

// const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const IntegrationCode = ({ t, account, slot = {}, classes, onCopy }) => {
	const { type, tags, fallbackUnit } = slot
	const identityAddr = account.identity.address

	let sizes = type.split('_')[1].split('x')
	sizes = {
		width: sizes[0],
		height: sizes[1],
	}

	const options = {
		publisherAddr: identityAddr,
		whitelistedToken: DAI.address,
		whitelistedType: type,
		randomize: true,
		targeting: tags || [],
		// marketURL: ADEX_MARKET_HOST,
		width: sizes.width,
		height: sizes.height,
		minPerImpression: '0',
		minTargetingScore: '0',
		fallbackUnit,
	}

	let query = encodeURIComponent(JSON.stringify({ options }))

	let src = ADVIEW_URL + query

	let iframeStr =
		`<iframe\n` +
		`	src="${src}"\n` +
		`	width="${sizes.width}"\n` +
		`	height="${sizes.height}"\n` +
		`	scrolling="no"\n` +
		`	frameborder="0"\n` +
		`	style="border: 0;"\n` +
		`	onload="${AUTO_HIDE_STRING}"\n` +
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
				<pre className={classes.integrationCode}>{iframeStr}</pre>
			</Paper>
			{process.env.NODE_ENV !== 'production' && (
				<div>
					<br />
					<div className={classes.integrationLabel}> {t('AD_PREVIEW')}</div>
					<div dangerouslySetInnerHTML={{ __html: iframeStr }} />
				</div>
			)}
		</div>
	)
}

export class Slot extends Component {
	constructor(props) {
		super(props)
		this.state = {
			editFallbackImg: false,
			tabIndex: 0,
		}
	}

	handleFallbackImgUpdateToggle = () => {
		const active = this.state.editFallbackImg
		this.setState({ editFallbackImg: !active })
	}

	handleTabChange = (event, index) => {
		this.setState({ tabIndex: index })
	}

	render() {
		const { t, classes, isDemo, item, account, itemType, ...rest } = this.props
		const { tabIndex } = this.state

		return (
			<div>
				<BasicProps
					item={item}
					itemType={itemType}
					t={t}
					url={item.adUrl}
					canEditImg={!isDemo}
					rightComponent={null}
					{...rest}
				/>
				<div>
					<AppBar position='static' color='default'>
						<Tabs
							value={tabIndex}
							onChange={this.handleTabChange}
							scrollable
							scrollButtons='off'
							indicatorColor='primary'
							textColor='primary'
						>
							<Tab label={t('STATISTICS')} />
							<Tab label={t('INTEGRATION')} />
						</Tabs>
					</AppBar>
					<div style={{ marginTop: 10 }}>
						{tabIndex === 0 && null}
						{tabIndex === 1 && (
							<IntegrationCode
								classes={classes}
								t={t}
								account={account}
								slot={item}
								onCopy={() =>
									this.props.actions.addToast({
										type: 'accept',
										action: 'X',
										label: t('COPIED_TO_CLIPBOARD'),
										timeout: 5000,
									})
								}
							/>
						)}
					</div>
				</div>
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
		updateImgExact: true,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const SlotItem = ItemHoc(withStyles(styles)(Slot))
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SlotItem)
