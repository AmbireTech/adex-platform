import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Grid, CircularProgress } from '@material-ui/core'
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
	selectNewCampaign,
	t,
} from 'selectors'
import { execute, getCampaignActualFees, checkNetworkCongestion } from 'actions'
import { GETTING_CAMPAIGNS_FEES, OPENING_CAMPAIGN } from 'constants/spinners'

const UnitsTable = ({ items }) => {
	return (
		<Grid item sm={12}>
			<ContentBody>
				<AdUnitsTable items={items} noSearch noActions noDownload noPrint />
			</ContentBody>
		</Grid>
	)
}

function CampaignFormPreview({ validateId } = {}) {
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const authType = useSelector(selectAuthType)
	const mainToken = useSelector(selectMainToken)
	const { symbol } = mainToken
	const feesSpinner = useSelector(state =>
		selectSpinnerById(state, GETTING_CAMPAIGNS_FEES)
	)

	const openingSpinner = useSelector(state =>
		selectSpinnerById(state, OPENING_CAMPAIGN)
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
	} = useSelector(selectNewCampaign)

	const { feesFormatted, totalSpendFormatted } = temp

	useEffect(() => {
		execute(getCampaignActualFees())
		execute(checkNetworkCongestion())
	}, [])

	return feesSpinner ? (
		<FullContentSpinner />
	) : (
		<ContentBox>
			{openingSpinner ? (
				<ContentStickyTop>
					<WalletAction t={t} authType={authType} />
				</ContentStickyTop>
			) : null}
			<ContentBody>
				<PropRow left={t('title', { isProp: true })} right={title} />
				<PropRow left={t('owner', { isProp: true })} right={identityAddr} />

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

				<PropRow
					left={t('FEES')}
					right={
						feesFormatted !== undefined ? (
							`${feesFormatted} ${symbol}`
						) : (
							<CircularProgress size={42} />
						)
					}
				/>
				<PropRow
					left={t('CAMPAIGN_FEES_AND_BUDGET')}
					right={
						totalSpendFormatted !== undefined ? (
							`${totalSpendFormatted} ${symbol}`
						) : (
							<CircularProgress size={42} />
						)
					}
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
				<PropRow
					left={t('adUnits', { isProp: true })}
					right={<UnitsTable items={adUnits} />}
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

CampaignFormPreview.propTypes = {
	newItem: PropTypes.object.isRequired,
}

export default CampaignFormPreview
