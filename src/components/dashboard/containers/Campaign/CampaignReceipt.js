import React, { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { execute, updateCompanyData } from 'actions'
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
	TextField,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import {
	t,
	selectCampaignStatsTableData,
	selectMainToken,
	selectAccountIdentityAddr,
	selectCampaignTotalValues,
	selectCompanyData,
} from 'selectors'
import classnames from 'classnames'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import TextFieldDebounced from 'components/common/fields/TextFieldDebounced'
import { formatAddress, formatNumberWithCommas } from 'helpers/formatters'

const useStyles = makeStyles(theme => {
	return {
		a4: {
			width: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
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
	const { totalClicks, totalImpressions, totalEarnings } = useSelector(state =>
		selectCampaignTotalValues(state, itemId)
	)
	const { companyName, firstLastName, address, country } = useSelector(state =>
		selectCompanyData(state)
	)
	return (
		<Box display='flex' justifyContent='center' alignContent='center'>
			<Box
				display='flex'
				justifyContent='center'
				alignContent='center'
				flexDirection='column'
			>
				<Box>
					<TextFieldDebounced
						label={'Company Name'}
						value={companyName || ''}
						debounceChange={value =>
							execute(updateCompanyData({ companyName: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'First And Last Name'}
						value={firstLastName || ''}
						debounceChange={value =>
							execute(updateCompanyData({ firstLastName: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'Address'}
						value={address || ''}
						debounceChange={value =>
							execute(updateCompanyData({ address: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'Country'}
						value={country || ''}
						debounceChange={value =>
							execute(updateCompanyData({ country: value }))
						}
						fullWidth
					/>
				</Box>
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
								<Typography variant='h4'>{`Receipt for XXX`}</Typography>
								<Typography variant='h5'>{`Account ID: ${formatAddress(
									identityAddr
								)}`}</Typography>
								<Typography variant='body2'>{`Receipt ID: ${formatAddress(
									itemId,
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
										<strong>{itemId}</strong>
									</Typography>
								</Box>
							</Box>
							<Box display='flex' flexDirection='column' alignItems='flex-end'>
								<Typography variant='h6'>{`Paid`}</Typography>
								<Typography variant='h4'>
									<strong>{`${formatNumberWithCommas(
										totalEarnings
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
										totalEarnings
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
									<strong>{formatNumberWithCommas(totalImpressions)}</strong>
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
									<strong>{formatNumberWithCommas(totalClicks)}</strong>
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
