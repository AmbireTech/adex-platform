import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
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

function CampaignFormPreview() {
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
				<Grid container spacing={1}>
					<Grid item xs={12} md={6}>
						<PropRow left={t('title', { isProp: true })} right={title} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('depositAmount', { isProp: true })}
							right={`${depositAmount} ${symbol}`}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('CPM', { isProp: true })}
							right={`${minPerImpression} ${symbol}`}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
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
					</Grid>

					<Grid item xs={12} md={6}>
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
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('activeFrom', { isProp: true })}
							right={formatDateTime(activeFrom)}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('withdrawPeriodStart', { isProp: true })}
							right={formatDateTime(withdrawPeriodStart)}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('CAMPAIGN_MIN_TARGETING')}
							right={t(minTargetingScore ? 'YES' : 'NO')}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
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
					</Grid>

					<Grid item xs={12}>
						<PropRow
							left={t('adUnits', { isProp: true })}
							right={
								<AdUnitsTable
									items={adUnits}
									noSearch
									noActions
									noDownload
									noPrint
								/>
							}
						/>
					</Grid>
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default CampaignFormPreview
