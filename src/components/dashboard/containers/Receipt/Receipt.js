import React from 'react'
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
} from '@material-ui/core'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import {
	t,
	selectCampaignStatsTableData,
	selectMainToken,
	selectAccountIdentityAddr,
	selectCampaignById,
	selectCompanyData,
} from 'selectors'
import { formatAddress, formatNumberWithCommas } from 'helpers/formatters'
import { formatUnits } from 'ethers/utils'

const useStyles = makeStyles(theme => {
	return {
		icon: {
			height: '3rem',
			width: 'auto',
		},
		dottedDivider: {
			borderBottom: `0.5px dotted ${theme.palette.grey.main}`,
		},
		solidDevider: {
			borderBottom: `0.5px solid ${theme.palette.grey.main}`,
		},
		breakdownTable: {
			width: '100%',
			textAlign: 'left',
		},
		breakAll: {
			whiteSpace: 'normal',
			wordBreak: 'break-all',
		},
		pageBreak: {
			pageBreakAfter: 'always',
		},
	}
})

function Receipt(props) {
	const classes = useStyles()
	const campaignId = props.campaignId
	const { symbol, decimals } = useSelector(selectMainToken)
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const campaignBreakdown = useSelector(state =>
		selectCampaignStatsTableData(state, campaignId)
	)
	const campaign = useSelector(state => selectCampaignById(state, campaignId))
	const { companyName, firstLastName, address, country } = useSelector(state =>
		selectCompanyData(state)
	)
	const humanFriendlyName = campaign.status.humanFriendlyName
	const receiptReady =
		humanFriendlyName === 'Closed' || humanFriendlyName === 'Completed'
	if (!receiptReady) return null
	return (
		//TODO: Translate everything
		//TODO: Render receipt height based on pages
		<Box mb={5} className={classnames(classes.pageBreak)}>
			<Box mb={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='h4'>{`Receipt for ${companyName ||
						'...'}`}</Typography>
					<Typography variant='h5'>{`Account ID: ${formatAddress(
						identityAddr
					)}`}</Typography>
					<Typography variant='body2'>{`Receipt ID: ${formatAddress(
						campaignId,
						'-'
					)}`}</Typography>
				</Box>
				<Box>
					<AdexIconTxt className={classnames(classes.icon)} />
				</Box>
			</Box>
			<Divider />
			<Box
				mt={5}
				display='flex'
				justifyContent='space-between'
				alignContent='center'
			>
				<Box display='flex' flexDirection='column'>
					<Box mb={2}>
						<Typography variant='subtitle2'>
							<strong>{`Company Details`}</strong>
						</Typography>
						<Typography variant='body2'>{companyName}</Typography>
						<Typography variant='body2'>{firstLastName}</Typography>
						<Typography variant='body2'>{address}</Typography>
						<Typography variant='body2'>{country}</Typography>
					</Box>
					<Box mb={2}>
						<Typography variant='body2'>{`Receipt/payment date`}</Typography>
						<Typography variant='subtitle2'>
							<strong>{`31 Aug 2017, 11:12`}</strong>
						</Typography>
					</Box>
					<Box mb={2}>
						<Typography variant='body2'>{`Campaign ID`}</Typography>
						<Typography variant='subtitle2'>
							<strong>{formatAddress(campaignId)}</strong>
						</Typography>
					</Box>
				</Box>
				<Box display='flex' flexDirection='column' alignItems='flex-end'>
					<Typography variant='h6'>{`Paid`}</Typography>
					<Typography variant='h4'>
						<strong>{`${formatNumberWithCommas(
							Number(formatUnits(campaign.depositAmount || '0', decimals)) *
								(campaign.status.fundsDistributedRatio / 1000)
						)} ${symbol}`}</strong>
					</Typography>
					{/* <Typography variant='p'>{`Total cost in USD ($XXX)`}</Typography> */}
				</Box>
			</Box>
			<Box display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='h6'>{`Campaign Overview`}</Typography>
				</Box>
			</Box>
			<Divider className={classnames(classes.dottedDivider)} />
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='body2'>
						{'From 2020-02-02 19:28, to 2020-03-31 19:28'}
					</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2'>
						<strong>{`${formatNumberWithCommas(
							Number(formatUnits(campaign.depositAmount || '0', decimals)) *
								(campaign.status.fundsDistributedRatio / 1000)
						)} ${symbol}`}</strong>
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
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='h6'>{`Campaign Breakdown`}</Typography>
				</Box>
			</Box>
			<Divider className={classnames(classes.dottedDivider)} />
			<Box>
				<Table size='small'>
					<TableHead>
						<TableRow className={classnames(classes.dottedDivider)}>
							<TableCell>
								<Typography variant='subtitle2'>
									<strong>{t('WEBSITE')}</strong>
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant='subtitle2'>
									<strong>{t('LABEL_IMPRESSIONS')}</strong>
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant='subtitle2'>
									<strong>{t('CHART_LABEL_CLICKS')}</strong>
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant='subtitle2'>
									<strong>{t('CTR')}</strong>
								</Typography>
							</TableCell>
							<TableCell>
								<Typography variant='subtitle2'>
									<strong>{t('WEBSITE_EARNINGS')}</strong>
								</Typography>
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{campaignBreakdown
							.sort((a, b) => b.earnings - a.earnings)
							.map(stats => (
								<TableRow>
									<TableCell className={classnames(classes.breakAll)}>
										<Typography variant='body2'>{stats.website}</Typography>
									</TableCell>
									<TableCell>
										<Typography variant='body2'>
											{formatNumberWithCommas(stats.impressions)}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant='body2'>
											{formatNumberWithCommas(stats.clicks)}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant='body2'>{`${stats.ctr}%`}</Typography>
									</TableCell>
									<TableCell>
										<Typography variant='body2'>
											{`${formatNumberWithCommas(stats.earnings)} ${symbol}`}
										</Typography>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</Box>
		</Box>
	)
}

Receipt.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default Receipt
