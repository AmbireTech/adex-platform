import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
	Grid,
	Box,
	CircularProgress,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
} from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import {
	WalletAction,
	FeesBreakdown,
} from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
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
	const [networkCongested, setNetworkCongested] = useState(false)

	const {
		title,
		// targeting,
		adUnits,
		validators,
		depositAmount,
		pricingBounds,
		// maxPerImpression,
		// depositAsset,
		withdrawPeriodStart,
		activeFrom,
		// minTargetingScore,
		targetingRules = {},
		audienceInput = {},
		// nonce
		temp = {},
	} = useSelector(selectNewCampaign)

	const { feesFormatted, totalSpendFormatted, breakdownFormatted } = temp
	const { IMPRESSION = {} } = pricingBounds || {}
	const { advanced = {} } = audienceInput.inputs

	useEffect(() => {
		async function checkNetwork() {
			const msg = await execute(checkNetworkCongestion())

			if (msg) {
				setNetworkCongested(msg)
			}
		}
		execute(getCampaignActualFees())
		checkNetwork()
	}, [])

	return feesSpinner ? (
		<FullContentSpinner />
	) : (
		<ContentBox>
			{openingSpinner || networkCongested ? (
				<ContentStickyTop>
					{openingSpinner && (
						<Box p={1}>
							<WalletAction t={t} authType={authType} />
						</Box>
					)}
					{networkCongested && (
						<Box p={1}>
							<Alert severity='warning' variant='filled' square>
								<AlertTitle>{t('NETWORK_WARNING')}</AlertTitle>
								{networkCongested}
							</Alert>
						</Box>
					)}
				</ContentStickyTop>
			) : null}
			<ContentBody>
				<Grid container>
					<Grid item xs={12} md={6}>
						<PropRow left={t('title', { isProp: true })} right={title} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
					</Grid>

					<Grid item xs={12} md={12}>
						<PropRow
							left={t('depositAmount', { isProp: true })}
							right={`${depositAmount} ${symbol}`}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('CPM_MIN_LABEL')}
							right={`${IMPRESSION.min} ${symbol}`}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('CPM_MAX_LABEL')}
							right={`${IMPRESSION.max} ${symbol}`}
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

					<Grid item xs={12}>
						<FeesBreakdown
							breakdownFormatted={breakdownFormatted}
							symbol={symbol}
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

					{/* <Grid item xs={12} md={6}>
						<PropRow
							left={t('CAMPAIGN_MIN_TARGETING')}
							right={t(minTargetingScore ? 'YES' : 'NO')}
						/>
					</Grid> */}

					<Grid item xs={12} md={12}>
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
					<Grid item xs={12} md={6}>
						<PropRow
							left={t(`CAMPAIGN_AUTO_UTM_TAGS`)}
							right={t(temp.useUtmTags ? 'YES' : 'NO')}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t(`CAMPAIGN_UTM_SRC_WITH_PUB`)}
							right={t(temp.useUtmSrcWithPub ? 'YES' : 'NO')}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t(`INCLUDE_INCENTIVIZED_TRAFFIC_LABEL`)}
							right={t(advanced.includeIncentivized ? 'YES' : 'NO')}
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<PropRow
							left={t(`DISABLE_FREQUENCY_CAPPING_LABEL`)}
							right={t(advanced.disableFrequencyCapping ? 'YES' : 'NO')}
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<PropRow
							left={t(`LIMIT_AVERAGE_DAILY_SPENDING_LABEL`)}
							right={t(advanced.limitDailyAverageSpending ? 'YES' : 'NO')}
						/>
					</Grid>

					<Grid item xs={12} md={12}>
						<PropRow
							left={t('AUDIENCE')}
							right={<AudiencePreview audienceInput={audienceInput.inputs} />}
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

					<Grid item xs={12}>
						<ExpansionPanel square={true} variant='outlined'>
							<ExpansionPanelSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls='targeting-rules-content'
								id='targeting-rules-header'
							>
								<Typography>{t('TARGETING_RULES')}</Typography>
							</ExpansionPanelSummary>
							<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
								<pre>{JSON.stringify(targetingRules || [], null, 2)}</pre>
							</Box>
						</ExpansionPanel>
					</Grid>
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default CampaignFormPreview
