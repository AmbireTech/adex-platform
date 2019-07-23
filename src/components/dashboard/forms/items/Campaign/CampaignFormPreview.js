import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import ItemsList from 'components/dashboard/containers/ItemsList'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
} from 'components/common/dialog/content'
import { AdUnit } from 'adex-models'
import { withStyles } from '@material-ui/core/styles'
import { styles } from '../styles'
import { formatDateTime } from 'helpers/formatters'

class CampaignFormPreview extends Component {
	constructor(props) {
		super(props)
		this.save = props.save
	}

	AdUnitsTable = ({ items }) => {
		return (

			<Grid item sm={12}>
				<ContentBody>
					<ItemsList
						objModel={AdUnit}
						items={items}
						listMode
						itemType={'AdUnit'}
						noControls
						padding='dense'
						noActions
						sortProperties={[]}
						viewModeId={'newCampaignAdUnitsPreview'}
					/>
				</ContentBody>
			</Grid>
		)
	}

	render() {
		const { account, newItem, t } = this.props
		const {
			// targeting,
			adUnits,
			validators,
			depositAmount,
			minPerImpression,
			// maxPerImpression,
			// depositAsset,
			withdrawPeriodStart,
			activeFrom,
			// nonce
		} = newItem

		return (
			<ContentBox>
				{newItem.temp.waitingAction ?
					<ContentStickyTop>
						<WalletAction t={t} authType={account.wallet.authType} />
					</ContentStickyTop> : null}
				<ContentBody>
					<PropRow
						left={t('owner', { isProp: true })}
						right={account.wallet.address}
					/>
					{/* <PropRow
						left={t('targeting', { isProp: true })}
						right={
							<UnitTargets
								{...rest}
								targets={targeting}
								t={t}
							// subHeader={'TARGETING'}
							/>
						}
					/> */}
					<PropRow
						left={t('adUnits', { isProp: true })}
						right={
							<this.AdUnitsTable
								items={adUnits}
							/>
						}
					/>
					<PropRow
						left={t('validators', { isProp: true })}
						right={
							<div>
								{validators.map(val =>
									<div key={val.id}>
										{`${val.url} - ${val.id}`}
									</div>)}
							</div>
						}
					/>
					<PropRow
						left={t('depositAmount', { isProp: true })}
						right={depositAmount + ' DAI'}
					/>
					<PropRow
						left={t('CPM', { isProp: true })}
						right={minPerImpression + ' DAI'}
					/>
					{/* <PropRow
						left={t('maxPerImpression', { isProp: true })}
						right={maxPerImpression}
					/> */}
					<PropRow
						left={t('activeFrom', { isProp: true })}
						right={formatDateTime(activeFrom)}
					/>
					<PropRow
						left={t('withdrawPeriodStart', { isProp: true })}
						right={formatDateTime(withdrawPeriodStart)}
					/>
					{/* <PropRow
						left={t('created', { isProp: true })}
						right={formatDateTime(created)}
					/> */}

					{/* </Grid> */}
					<br />
				</ContentBody>
			</ContentBox>
		)
	}
}

CampaignFormPreview.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string
}

function mapStateToProps(state) {
	const { persist } = state
	return {
		account: persist.account
	}
}

const NewCampaignFormPreview = NewCampaignHoc(withStyles(styles)(CampaignFormPreview))
export default connect(
	mapStateToProps
)(Translate(NewCampaignFormPreview))
