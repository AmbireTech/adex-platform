import React from 'react'
import {
	Grid,
	Box,
	InputAdornment,
	Button,
	Divider,
	CircularProgress,
} from '@material-ui/core'
import { StopSharp, PauseSharp, StarSharp } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { BigNumber } from 'ethers'
import {
	ItemTitle,
	MediaCard,
	ItemSpecProp,
} from 'components/dashboard/containers/ItemCommon/'
import { TargetingRulesEdit } from 'components/dashboard/containers/Campaign/CampaignEdits'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { mapStatusIcons } from 'components/dashboard/containers/Tables/tableHelpers'
import {
	t,
	selectMainToken,
	selectSpinnerById,
	selectCampaignDisplayStatus,
} from 'selectors'
import {
	execute,
	closeCampaign,
	pauseOrResumeCampaign,
	confirmAction,
	mapCurrentToNewCampaignAudienceInput,
} from 'actions'
import { useSelector } from 'react-redux'

const getCloseCampaignsFees = ({
	depositAmount,
	validators,
	fundsDistributedRatio,
	decimals,
}) => {
	const deposit = BigNumber.from(depositAmount)
	const totalFees = validators.reduce(
		(sum, { fee }) => sum.add(BigNumber.from(fee)),
		BigNumber.from(0)
	)

	const feesPercent =
		totalFees
			.mul(BigNumber.from(10000))
			.div(deposit)
			.toNumber() / 100

	const nonDistributedFunds = deposit.sub(
		deposit
			.mul(fundsDistributedRatio)
			.div(BigNumber.from(1000))
			.toString()
	)

	const feesToPay = totalFees.sub(
		totalFees
			.mul(fundsDistributedRatio)
			.div(BigNumber.from(1000))
			.toString()
	)

	const percent = feesPercent.toFixed(2) + '%'
	const toPay = formatTokenAmount(feesToPay, decimals, false, 2)
	const nonDistributed = formatTokenAmount(
		nonDistributedFunds,
		decimals,
		false,
		2
	)

	return { percent, toPay, nonDistributed }
}

const useStyles = makeStyles(theme => ({
	wrapper: {
		margin: theme.spacing(1),
		position: 'relative',
	},
	buttonProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
}))

export const CampaignBasic = ({
	item,
	canSendMsgs,
	isActive,
	...hookProps
}) => {
	const classes = useStyles()
	const {
		title,
		adUnits = [],
		pricingBounds,
		depositAmount,
		validators,
		minPerImpression,
		maxPerImpression,
		audienceInput,
	} = item

	const { advanced = {} } = (audienceInput || {}).inputs || {}
	const { decimals, symbol } = selectMainToken()
	const { title: errTitle } = hookProps.validations

	const { mediaUrl, mediaMime } = adUnits[0] || {}
	const status = item.status || {}
	const { fundsDistributedRatio } = status
	const displayStatus = selectCampaignDisplayStatus(status)
	const isPaused = ((item.targetingRules || [])[0] || {}).onlyShowIf === false
	const pauseAction = isPaused ? 'RESUME' : 'PAUSE'

	const campaignPricingBounds = pricingBounds || { IMPRESSION: {} }
	const cpmMin = campaignPricingBounds.min || minPerImpression || 0
	const cpmMax = campaignPricingBounds.max || maxPerImpression || 0

	const closeSpinner = useSelector(state =>
		selectSpinnerById(state, `closing-campaign-${item.id}`)
	)

	const pauseSpinner = useSelector(state =>
		selectSpinnerById(state, `pausing-campaign-${item.id}`)
	)

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} sm={12} md={6} lg={5}>
				<Box my={1}>
					<MediaCard mediaUrl={mediaUrl} mediaMime={mediaMime} />
				</Box>
				{isActive && (
					<Grid container spacing={1} alignItems='center'>
						<Grid item xs={12} sm={6} md={12} lg={6}>
							<div className={classes.wrapper}>
								<Button
									variant='contained'
									color='secondary'
									size='large'
									fullWidth
									onClick={() => {
										const {
											percent,
											toPay,
											nonDistributed,
										} = getCloseCampaignsFees({
											depositAmount,
											validators,
											fundsDistributedRatio,
										})
										execute(
											confirmAction(
												() => execute(closeCampaign({ campaign: item })),
												null,
												{
													confirmLabel: t('CLOSE_CAMPAIGN_CONFIRM_LABEL'),
													cancelLabel: t('CANCEL'),
													title: t('CLOSE_CAMPAIGN_CONFIRM_TITLE', {
														args: [title],
													}),
													text: t('CLOSE_CAMPAIGN_CONFIRM_INFO', {
														args: [percent, toPay, nonDistributed, symbol],
													}),
												}
											)
										)
									}}
									disabled={closeSpinner || !canSendMsgs}
									endIcon={<StopSharp />}
								>
									{t('BTN_CLOSE_CAMPAIGN')}
								</Button>
								{closeSpinner && (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								)}
							</div>
						</Grid>

						<Grid item xs={12} sm={6} md={12} lg={6}>
							<div className={classes.wrapper}>
								<Button
									variant='contained'
									color='secondary'
									size='large'
									fullWidth
									onClick={() => {
										execute(
											confirmAction(
												() =>
													execute(pauseOrResumeCampaign({ campaign: item })),
												null,
												{
													confirmLabel: t(
														`${pauseAction}_CAMPAIGN_CONFIRM_LABEL`
													),
													cancelLabel: t('CANCEL'),
													title: t(`${pauseAction}_CAMPAIGN_CONFIRM_TITLE`, {
														args: [title],
													}),
													text: t(`${pauseAction}_CAMPAIGN_CONFIRM_INFO`, {
														args: [],
													}),
												}
											)
										)
									}}
									disabled={pauseSpinner || !canSendMsgs}
									endIcon={isPaused ? <StarSharp /> : <PauseSharp />}
								>
									{t(`BTN_${pauseAction}_CAMPAIGN`)}
								</Button>
								{pauseSpinner && (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								)}
							</div>
						</Grid>
					</Grid>
				)}
			</Grid>

			<Grid item xs={12} sm={12} md={6} lg={7}>
				<Box mt={1}>
					<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
				</Box>
				<Box mt={1}>
					<ItemSpecProp
						prop={'id'}
						value={item.id}
						label={t('id', { isProp: true })}
					/>
				</Box>

				<Grid container spacing={2}>
					<Grid item xs={12} sm={12} md={6}>
						<Box my={0}>
							<ItemSpecProp
								prop={'displayStatus'}
								value={displayStatus}
								label={t(displayStatus)}
								InputProps={{
									endAdornment: (
										<InputAdornment position='end'>
											{mapStatusIcons(status, 'md')}
										</InputAdornment>
									),
								}}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'created'}
								value={formatDateTime(item.created)}
								label={t('created', { isProp: true })}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'activeFrom'}
								value={formatDateTime(item.activeFrom)}
								label={t('activeFrom', { isProp: true })}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'withdrawPeriodStart'}
								value={formatDateTime(item.withdrawPeriodStart)}
								label={t('withdrawPeriodStart', { isProp: true })}
							/>
						</Box>
						{/* <Box my={1}>
										<ItemSpecProp
											prop={'CAMPAIGN_MIN_TARGETING'}
											value={item.minTargetingScore > 0 ? t('YES') : t('NO')}
											label={t('CAMPAIGN_MIN_TARGETING')}
										/>
									</Box> */}
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<Box my={0}>
							<ItemSpecProp
								prop={'fundsDistributedRatio'}
								value={((fundsDistributedRatio || 0) / 10).toFixed(2)}
								label={t('PROP_DISTRIBUTED', { args: ['%'] })}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'depositAmount'}
								value={
									formatTokenAmount(item.depositAmount, decimals) + ' ' + symbol
								}
								label={t('depositAmount', { isProp: true })}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'CPM_MIN'}
								value={
									formatTokenAmount(
										BigNumber.from(cpmMin || 0).mul(1000),
										decimals,
										true
									) +
									' ' +
									symbol
								}
								label={t('CPM_MIN')}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'CPM_MAX'}
								value={
									formatTokenAmount(
										BigNumber.from(cpmMax || 0).mul(1000),
										decimals,
										true
									) +
									' ' +
									symbol
								}
								label={t('CPM_MAX')}
							/>
						</Box>
					</Grid>
				</Grid>
				<Box mt={3} mb={1}>
					<Divider />
				</Box>
				<Grid container spacing={2} pt={2}>
					<Grid item xs={12} sm={12} md={12} lg={6}>
						<Box my={0}>
							<ItemSpecProp
								prop={'INCLUDE_INCENTIVIZED_TRAFFIC_LABEL'}
								value={t(advanced.includeIncentivized ? 'YES' : 'NO')}
								label={t('INCLUDE_INCENTIVIZED_TRAFFIC_LABEL')}
							/>
						</Box>
						<Box my={0}>
							<ItemSpecProp
								prop={'DISABLE_FREQUENCY_CAPPING_LABEL'}
								value={t(advanced.disableFrequencyCapping ? 'YES' : 'NO')}
								label={t('DISABLE_FREQUENCY_CAPPING_LABEL')}
							/>
						</Box>
					</Grid>
					<Grid item xs={12} sm={12} md={12} lg={6}>
						<Box my={0}>
							<ItemSpecProp
								prop={'LIMIT_AVERAGE_DAILY_SPENDING_LABEL'}
								value={t(advanced.limitDailyAverageSpending ? 'YES' : 'NO')}
								label={t('LIMIT_AVERAGE_DAILY_SPENDING_LABEL')}
							/>
						</Box>
						<Box mt={1}>
							{isActive && (
								<TargetingRulesEdit
									fullWidth
									advancedOnly
									fieldName='campaignAdvanced'
									stepTitle='PROP_CAMPAIGN_ADVANCED'
									btnLabel='EDIT_CAMPAIGN_ADVANCED'
									title='EDIT_CAMPAIGN_ADVANCED_TITLE'
									itemId={item.id}
									disabled={!canSendMsgs}
									disableBackdropClick
									updateField={hookProps.updateField}
									color='secondary'
									variant='contained'
									onClick={() =>
										execute(
											mapCurrentToNewCampaignAudienceInput({
												itemId: item.id,
												dirtyProps: hookProps.dirtyProps,
											})
										)
									}
								/>
							)}
						</Box>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}
