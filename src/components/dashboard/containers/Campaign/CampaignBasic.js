import React, { Fragment } from 'react'
import {
	Paper,
	Grid,
	Box,
	InputAdornment,
	Button,
	CircularProgress,
} from '@material-ui/core'
import { StopSharp, PauseSharp, StarSharp } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { bigNumberify } from 'ethers/utils'
import {
	ItemTitle,
	MediaCard,
	ItemSpecProp,
	ChangeControls,
} from 'components/dashboard/containers/ItemCommon/'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { mapStatusIcons } from 'components/dashboard/containers/Tables/tableHelpers'
import { t, selectMainToken, selectSpinnerById } from 'selectors'
import {
	execute,
	closeCampaign,
	pauseOrResumeCampaign,
	confirmAction,
} from 'actions'
import { useSelector } from 'react-redux'

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
		minPerImpression,
		maxPerImpression,
	} = item
	const { decimals, symbol } = selectMainToken()
	const { title: errTitle } = hookProps.validations

	const { mediaUrl, mediaMime } = adUnits[0] || {}
	const status = item.status || {}
	const { humanFriendlyName } = status
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
														args: [],
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
				<Box my={1}>
					<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
				</Box>
				<Box my={1}>
					<ItemSpecProp
						prop={'id'}
						value={item.id}
						label={t('id', { isProp: true })}
					/>
				</Box>

				<Grid container spacing={2}>
					<Grid item xs={12} sm={12} md={6}>
						<Box my={1}>
							<ItemSpecProp
								prop={'humanFriendlyName'}
								value={t(humanFriendlyName, { toUpperCase: true })}
								label={t('status', { isProp: true })}
								InputProps={{
									endAdornment: (
										<InputAdornment position='end'>
											{mapStatusIcons(humanFriendlyName, status.name, 'md')}
										</InputAdornment>
									),
								}}
							/>
						</Box>
						<Box my={1}>
							<ItemSpecProp
								prop={'created'}
								value={formatDateTime(item.created)}
								label={t('created', { isProp: true })}
							/>
						</Box>
						<Box my={1}>
							<ItemSpecProp
								prop={'activeFrom'}
								value={formatDateTime(item.activeFrom)}
								label={t('activeFrom', { isProp: true })}
							/>
						</Box>
						<Box my={1}>
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
						<Box my={1}>
							<ItemSpecProp
								prop={'fundsDistributedRatio'}
								value={((status.fundsDistributedRatio || 0) / 10).toFixed(2)}
								label={t('PROP_DISTRIBUTED', { args: ['%'] })}
							/>
						</Box>
						<Box my={1}>
							<ItemSpecProp
								prop={'depositAmount'}
								value={
									formatTokenAmount(item.depositAmount, decimals) + ' ' + symbol
								}
								label={t('depositAmount', { isProp: true })}
							/>
						</Box>
						<Box my={1}>
							<ItemSpecProp
								prop={'CPM_MIN'}
								value={
									formatTokenAmount(
										bigNumberify(cpmMin || 0).mul(1000),
										decimals,
										true
									) +
									' ' +
									symbol
								}
								label={t('CPM_MIN')}
							/>
						</Box>
						<Box my={1}>
							<ItemSpecProp
								prop={'CPM_MAX'}
								value={
									formatTokenAmount(
										bigNumberify(cpmMax || 0).mul(1000),
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
			</Grid>
			<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
		</Grid>
	)
}
