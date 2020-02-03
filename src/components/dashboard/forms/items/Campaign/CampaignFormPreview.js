import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Grid from '@material-ui/core/Grid'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import { formatDateTime } from 'helpers/formatters'
import {
	selectAccountIdentityAddr,
	selectAuthType,
	selectMainToken,
	selectSpinnerById,
	t,
} from 'selectors'
import { execute, getCampaignActualFees } from 'actions'
import { GETTING_CAMPAIGNS_FEES } from 'constants/spinners'

const UnitsTable = ({ items }) => {
	return (
		<Grid item sm={12}>
			<ContentBody>
				<AdUnitsTable items={items} noSearch noActions noDownload noPrint />
			</ContentBody>
		</Grid>
	)
}

function CampaignFormPreview({ newItem } = {}) {
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const authType = useSelector(selectAuthType)
	const mainToken = useSelector(selectMainToken)
	const { symbol } = mainToken
	const spinner = useSelector(state =>
		selectSpinnerById(state, GETTING_CAMPAIGNS_FEES)
	)

	const {
		title,
		// targeting,
		adUnits,
		validators,
		depositAmount,
		minPerImpression,
		// maxPerImpression,
		// depositAsset,
		withdrawPeriodStart,
		activeFrom,
		minTargetingScore,
		// nonce
		temp = {},
	} = newItem

	useEffect(() => {
		execute(getCampaignActualFees())
	}, [])

	return spinner ? (
		<FullContentSpinner />
	) : (
		<ContentBox>
			{temp.waitingAction ? (
				<ContentStickyTop>
					<WalletAction t={t} authType={authType} />
				</ContentStickyTop>
			) : null}
			<ContentBody>
				<PropRow left={t('title', { isProp: true })} right={title} />
				<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
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
					right={<UnitsTable items={adUnits} />}
				/>
				<PropRow
					left={t('validators', { isProp: true })}
					right={
						<div>
							{validators.map(val => (
								<div key={val.id}>{`${val.url} - ${val.id}`}</div>
							))}
						</div>
					}
				/>
				<PropRow
					left={t('CPM', { isProp: true })}
					right={`${minPerImpression} ${symbol}`}
				/>
				<PropRow
					left={t('depositAmount', { isProp: true })}
					right={`${depositAmount} ${symbol}`}
				/>

				<PropRow left={t('FEES')} right={`${temp.feesFormatted} ${symbol}`} />
				<PropRow
					left={t('CAMPAIGN_FEES_AND_BUDGET')}
					right={`${temp.totalSpendFormatted} ${symbol}`}
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
				{minTargetingScore && <PropRow right={t('CAMPAIGN_MIN_TARGETING')} />}
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

CampaignFormPreview.propTypes = {
	newItem: PropTypes.object.isRequired,
}

const NewCampaignFormPreview = NewCampaignHoc(CampaignFormPreview)
export default NewCampaignFormPreview
