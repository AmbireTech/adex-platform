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
import { makeStyles } from '@material-ui/core/styles'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import {
	t,
	selectMainToken,
	selectAccountIdentityAddr,
	selectCompanyData,
	selectPublisherReceiptsStatsByMonthTableData,
	selectPublisherReceiptsStatsByMonthTotalValues,
} from 'selectors'
import {
	formatAddress,
	formatDateTime,
	formatDate,
	formatNumberWithCommas,
} from 'helpers/formatters'
import { BigNumber } from 'ethers'
import moment from 'moment'
import { styles } from './styles'
const useStyles = makeStyles(styles)

export function PublisherReceiptTpl({ date } = {}) {
	const classes = useStyles()
	const { symbol } = useSelector(selectMainToken)
	const identityAddr = useSelector(selectAccountIdentityAddr)

	const monthBreakdown = useSelector(state =>
		selectPublisherReceiptsStatsByMonthTableData(state, date)
	)

	const { totalPayouts, totalImpressions } = useSelector(state =>
		selectPublisherReceiptsStatsByMonthTotalValues(state, date)
	)
	const cpm = ((totalPayouts / totalImpressions) * 1000).toFixed(2)

	const { companyName, firstLastName, address, country } = useSelector(
		selectCompanyData
	)
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
						args: [
							//Unique receipt number made from identity address and the month of the receipt
							formatAddress(
								`${BigNumber.from(
									moment(date)
										.startOf('month')
										.unix() * 1000
								).toHexString()}${identityAddr.substr(5)}`,
								'-'
							),
						],
					})}`}</Typography>
				</Box>
				<Box>
					<AdexIconTxt className={classnames(classes.icon)} />
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
							<strong>
								{formatDate(
									moment(date)
										.endOf('month')
										.format('YYYY-MM-DD')
								)}
							</strong>
						</Typography>
					</Box>
				</Box>
				<Box mb={2} display='flex' flexDirection='column' alignItems='flex-end'>
					<Typography variant='h6' align='right'>
						{t('RECEIPT_EARNED')}
					</Typography>
					<Typography variant='h4' align='right'>
						<strong>{`${formatNumberWithCommas(
							totalPayouts.toFixed(2)
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
								moment(date)
									.startOf('month')
									.format('YYYY-MM-DD'),
								moment(date)
									.endOf('month')
									.format('YYYY-MM-DD'),
							],
						})}
					</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2' align='right'>
						<strong>{`${formatNumberWithCommas(
							totalPayouts.toFixed(2)
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
						<strong>{formatNumberWithCommas(totalImpressions)}</strong>
					</Typography>
				</Box>
			</Box>
			<Divider />
			<Box mt={2} display='flex' justifyContent='space-between'>
				<Box>
					<Typography variant='body2'>{t('LABEL_AVG_CPM')}</Typography>
				</Box>
				<Box>
					<Typography variant='subtitle2'>
						<strong>{`${isFinite(cpm) ? cpm : Number(0).toFixed(2)}`}</strong>
					</Typography>
				</Box>
			</Box>
			<Divider />
			{monthBreakdown.length > 0 ? (
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
												<strong>{t('LABEL_DATE')}</strong>
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='subtitle2'>
												<strong>{t('LABEL_IMPRESSIONS')}</strong>
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='subtitle2'>
												<strong>{`${t('RECEIPT_EARNED')} (${symbol})`}</strong>
											</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{monthBreakdown
										.sort((a, b) => a.date - b.date)
										.map((stats, i) => (
											<TableRow key={i}>
												<TableCell align='left'>
													<Typography variant='body2'>
														{`${formatDateTime(stats.date, 'YYYY-MM-DD')}`}
													</Typography>
												</TableCell>
												<TableCell align='right'>
													<Typography variant='body2'>
														{formatNumberWithCommas(stats.impressions)}
													</Typography>
												</TableCell>
												<TableCell align='right'>
													<Typography variant='body2'>
														{`${formatNumberWithCommas(
															stats.payouts.toFixed(2)
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
			) : (
				<Box
					mt={2}
					display='flex'
					justifyContent='space-around'
					alignContent='center'
				>
					<Typography>{t('NO_REVENUE_THIS_MONTH')}</Typography>
				</Box>
			)}
		</Box>
	)
}

PublisherReceiptTpl.propTypes = {
	date: PropTypes.any.isRequired,
}
