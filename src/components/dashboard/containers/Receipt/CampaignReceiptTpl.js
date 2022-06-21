import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
	Box,
	Typography,
	Divider,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	TableContainer,
} from '@material-ui/core'
import classnames from 'classnames'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import AdexIconTxt from 'resources/adex-logo-txt-sm.svg'
import AdexIconTxtDark from 'resources/adex-logo-txt-dark-theme.svg'
import Media from 'components/common/media'
import PageNotFound from 'components/page_not_found/PageNotFound'
import {
	t,
	selectCampaignStatsTableData,
	selectMainToken,
	selectAccountIdentityAddr,
	selectCampaignWithAnalyticsById,
	selectCompanyData,
} from 'selectors'
import {
	formatAddress,
	formatDateTime,
	formatNumberWithCommas,
} from 'helpers/formatters'
import { utils } from 'ethers'
import { styles } from './styles'
const useStyles = makeStyles(styles)

export function CampaignReceiptTpl({ campaignId } = {}) {
	const theme = useTheme()
	const classes = useStyles()
	const { symbol, decimals } = useSelector(selectMainToken)
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const campaignBreakdown = useSelector(state =>
		selectCampaignStatsTableData(state, campaignId)
	)
	const campaign = useSelector(state =>
		selectCampaignWithAnalyticsById(state, campaignId)
	)
	const { companyName, firstLastName, address, country } = useSelector(
		selectCompanyData
	)
	const AdxIcon = theme.type === 'dark' ? AdexIconTxtDark : AdexIconTxt
	const humanFriendlyName = (campaign.status || {}).humanFriendlyName
	const receiptReady =
		humanFriendlyName === 'Closed' || humanFriendlyName === 'Completed'
	if (!campaign.spec || !campaign.creator) {
		return (
			<PageNotFound
				title={t('ITEM_NOT_FOUND_TITLE')}
				subtitle={t('ITEM_NOT_FOUND_SUBTITLE', {
					args: ['CAMPAIGN', campaignId],
				})}
				goToPath={`/dashboard/advertiser`}
				goToTxt='GO_TO_DASHBOARD'
			/>
		)
	}
	if (!receiptReady) return null
	return (
		<Box p={2} mb={5} className={classnames(classes.pageBreak)} width={1}>
			<Box mb={2} display='flex' justifyContent='space-between' flexWrap='wrap'>
				<Box>
					<Typography variant='h4' gutterBottom>{`${t('RECEIPT_FOR', {
						args: [companyName || '...'],
					})}`}</Typography>
					<Typography variant='h5' gutterBottom>{`${t('RECEIPT_ACCOUNT_ID', {
						args: [formatAddress(identityAddr)],
					})}`}</Typography>
					<Typography variant='body2' gutterBottom>{`${t('RECEIPT_ID', {
						args: [formatAddress(campaignId, '-')],
					})}`}</Typography>
				</Box>
				<Box>
					<Media src={AdxIcon} classNameImg={classes.icon} />
				</Box>
			</Box>
			<Divider />
			<Box
				mt={3}
				display='flex'
				justifyContent='space-between'
				alignContent='center'
				flexDirection='row'
				flexWrap='wrap'
			>
				<Box display='flex' flexDirection='column'>
					<Box mb={2}>
						<Typography variant='subtitle2'>
							<strong>{t('RECEIPT_COMPANY_DETAILS')}</strong>
						</Typography>
						<Typography variant='body2'>{companyName}</Typography>
						<Typography variant='body2'>{firstLastName}</Typography>
						<Typography variant='body2'>{address}</Typography>
						<Typography variant='body2'>{country}</Typography>
					</Box>
					<Box mb={2}>
						<Typography variant='body2'>{t('RECEIPT_PAYMENT_DATE')}</Typography>
						<Typography variant='subtitle2'>
							{/* TODO: Need a date when the campaign has beeen completed */}
							<strong>{formatDateTime(campaign.withdrawPeriodStart)}</strong>
						</Typography>
					</Box>
					<Box mb={2}>
						<Typography variant='body2'>{t('RECEIPT_CAMPAIGN_ID')}</Typography>
						<Typography variant='subtitle2'>
							<strong>{formatAddress(campaignId)}</strong>
						</Typography>
					</Box>
				</Box>
				<Box mb={2} display='flex' flexDirection='column' alignItems='flex-end'>
					<Typography variant='h6' align='right'>
						{t('RECEIPT_PAID')}
					</Typography>
					<Typography variant='h4' align='right'>
						<strong>{`${formatNumberWithCommas(
							(
								Number(
									utils.formatUnits(campaign.depositAmount || '0', decimals)
								) *
								(campaign.status.fundsDistributedRatio / 1000)
							).toFixed(2)
						)} ${symbol}`}</strong>
					</Typography>
					{/* <Typography variant='p'>{`Total cost in USD ($XXX)`}</Typography> */}
				</Box>
			</Box>
			<Box display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='h6'>{t('RECEIPT_CAMPAIGN_OVERVIEW')}</Typography>
				</Box>
			</Box>
			<Divider className={classnames(classes.dottedDivider)} />
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='body2'>
						{t('RECEIPT_FROM_TO', {
							args: [
								formatDateTime(campaign.activeFrom),
								formatDateTime(campaign.withdrawPeriodStart),
							],
						})}
					</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2'>
						<strong>{`${
							campaign.status.fundsDistributedRatio && campaign.depositAmount
								? utils.commify(
										Number(
											utils.formatUnits(campaign.depositAmount || '	0', decimals)
										) *
											(campaign.status.fundsDistributedRatio / 1000)
								  )
								: Number(0).toFixed(2)
						} ${symbol}`}</strong>
					</Typography>
				</Box>
			</Box>
			<Divider />
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='body2'>{t('LABEL_IMPRESSIONS')}</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2'>
						<strong>{formatNumberWithCommas(campaign.impressions)}</strong>
					</Typography>
				</Box>
			</Box>
			<Divider />
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='body2'>{t('LABEL_CLICKS')}</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2'>
						<strong>{formatNumberWithCommas(campaign.clicks)}</strong>
					</Typography>
				</Box>
			</Box>
			<Divider />

			{campaignBreakdown.length > 0 && (
				<Fragment>
					<Box mt={2} display='flex' justifyContent='space-between'>
						<Box>
							<Typography variant='h6' gutterBottom>
								{t('RECEIPT_CAMPAIGN_BREAKDOWN')}
							</Typography>
						</Box>
					</Box>
					<Divider className={classnames(classes.dottedDivider)} />
					<Box>
						<TableContainer>
							<Table size='small'>
								<TableHead>
									<TableRow className={classnames(classes.dottedDivider)}>
										<TableCell align='left'>
											<Typography variant='subtitle2'>
												<strong>{t('WEBSITE')}</strong>
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='subtitle2'>
												<strong>{t('LABEL_IMPRESSIONS')}</strong>
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='subtitle2'>
												<strong>{t('CHART_LABEL_CLICKS')}</strong>
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='subtitle2'>
												<strong>
													{`${t('WEBSITE_EARNINGS')} (${symbol})`}
												</strong>
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{campaignBreakdown
										.sort((a, b) => b.earnings - a.earnings)
										.map((stats, i) => (
											<TableRow key={i}>
												<TableCell
													align='left'
													className={classnames(classes.breakAll)}
												>
													<Typography variant='body2'>
														{stats.website}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography align='right' variant='body2'>
														{formatNumberWithCommas(stats.impressions)}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography align='right' variant='body2'>
														{formatNumberWithCommas(stats.clicks)}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography align='right' variant='body2'>
														{`${formatNumberWithCommas(
															stats.earnings.toFixed(2)
														)}`}
													</Typography>
												</TableCell>
											</TableRow>
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Fragment>
			)}
		</Box>
	)
}

CampaignReceiptTpl.propTypes = {
	campaignId: PropTypes.string.isRequired,
}
