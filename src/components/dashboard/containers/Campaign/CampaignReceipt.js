import React, { useRef } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
	Box,
	Card,
	Button,
	Typography,
	Divider,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import {
	t,
	selectCampaignStatsTableData,
	selectMainToken,
	selectCampaignStatsMaxValues,
	selectAccountIdentityAddr,
} from 'selectors'
import classnames from 'classnames'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import { formatAddress, formatNumberWithCommas } from 'helpers/formatters'

const useStyles = makeStyles(TableCelleme => {
	return {
		a4: {
			widTableCell: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
		icon: {
			height: '3rem',
			width: 'auto',
		},
		dottedDivider: {
			borderBottom: `0.5px dotted ${TableCelleme.palette.grey.main}`,
		},
		solidDevider: {
			borderBottom: `0.5px solid ${TableCelleme.palette.grey.main}`,
		},
		breakdownTable: {
			width: '100%',
			textAlign: 'left',
		},
	}
})
function CampaignReceipt() {
	const classes = useStyles()
	const { itemId } = useParams()
	const invoice = useRef()
	const { symbol } = useSelector(selectMainToken)
	const identityAddr = useSelector(selectAccountIdentityAddr)
	const campaignBreakdown = useSelector(state =>
		selectCampaignStatsTableData(state, itemId)
	)
	const { maxClicks, maxImpressions, maxEarnings } = useSelector(state =>
		selectCampaignStatsMaxValues(state, itemId)
	)
	console.log('CB', campaignBreakdown)
	return (
		<Box display='flex' justifyContent='center' alignContent='center'>
			<Box
				display='flex'
				justifyContent='center'
				alignContent='center'
				flexDirection='column'
			>
				<Box>
					<ReactToPrint
						trigger={() => <Button>Print</Button>}
						content={() => invoice.current}
					/>
				</Box>
				<Card>
					<Box ref={invoice} className={classnames(classes.a4)}>
						<Box mb={2} display='flex' justifyContent='space-between'>
							<Box>
								<Typography variant='h4'>{`Invoice for XXX`}</Typography>
								<Typography variant='h5'>{`Account ID: ${formatAddress(
									identityAddr
								)}`}</Typography>
								<Typography variant='body2'>{`Invoice ID: ${itemId}`}</Typography>
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
									<Typography variant='body2'>{`My Cool Company LTableCell .`}</Typography>
									<Typography variant='body2'>{`First Last Name`}</Typography>
									<Typography variant='body2'>{`Address`}</Typography>
									<Typography variant='body2'>{`Country`}</Typography>
								</Box>
								<Box mb={2}>
									<Typography variant='body2'>{`Invoice/payment date`}</Typography>
									<Typography variant='subtitle2'>
										<strong>{`31 Aug 2017, 11:12`}</strong>
									</Typography>
								</Box>
								<Box mb={2}>
									<Typography variant='body2'>{`Campaign ID`}</Typography>
									<Typography variant='subtitle2'>
										<strong>{itemId}</strong>
									</Typography>
								</Box>
							</Box>
							<Box display='flex' flexDirection='column' alignItems='flex-end'>
								<Typography variant='h6'>{`Paid`}</Typography>
								<Typography variant='h4'>
									<strong>{`${formatNumberWithCommas(
										maxEarnings
									)} ${symbol}`}</strong>
								</Typography>
								<Typography variant='p'>{`Total cost in USD ($XXX)`}</Typography>
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
										maxEarnings
									)} ${symbol}`}</strong>
								</Typography>
							</Box>
						</Box>
						<Divider />
						<Box mt={2} display='flex' justifyContent='space-between'>
							<Box>
								<Typography variant='body2'>
									{t('LABEL_IMPRESSIONS')}
								</Typography>
							</Box>
							<Box>
								<Typography variant='subtitle2'>
									<strong>{formatNumberWithCommas(maxImpressions)}</strong>
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
									<strong>{formatNumberWithCommas(maxClicks)}</strong>
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
											<TableCell>
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
													{`${formatNumberWithCommas(
														stats.earnings
													)} ${symbol}`}
												</Typography>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
