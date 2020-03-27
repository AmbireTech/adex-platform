import React, { useRef, useEffect, useState } from 'react'
import { useParams, Redirect } from 'react-router'
import { Box, Card, Button, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print, Visibility, CalendarToday } from '@material-ui/icons'
import { CampaignReceiptTpl, PublisherReceiptTpl } from './ReceiptTemplates'
import CompanyDetails from './CompanyDetails'
import { useSelector } from 'react-redux'
import {
	t,
	selectSelectedCampaigns,
	selectSide,
	selectSelectedPublisherReceipts,
	selectSpinnerById,
	selectAccountIdentityDeployData,
	selectReceiptMonths,
} from 'selectors'
import { execute, resetSelectedItems, getReceiptData } from 'actions'
import Dropdown from 'components/common/dropdown'
import { FETCHING_PUBLISHER_RECEIPTS } from 'constants/spinners'
import { LinearProgress } from '@material-ui/core'

const useStyles = makeStyles(theme => {
	return {
		a4: {
			width: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
		hideOnMobile: {
			[theme.breakpoints.down('sm')]: {
				display: 'none',
			},
		},
		hideOnDesktop: {
			[theme.breakpoints.up('md')]: {
				display: 'none',
			},
		},
		progress: {
			width: '100%',
		},
	}
})

function Receipt(props) {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId, date } = useParams()
	const side = useSelector(selectSide)
	const selectedCampaigns = useSelector(state => selectSelectedCampaigns(state))
	// const selectedPublisherReceipts = useSelector(state =>
	// 	selectSelectedPublisherReceipts(state)
	// )

	const selectedByPropsOrParams = props.itemId || itemId || date

	const { created } = useSelector(state =>
		selectAccountIdentityDeployData(state)
	)
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const dates = useSelector(() => selectReceiptMonths(startDate, endDate))
	const validateStartDate =
		startDate <= endDate && startDate !== '' && endDate !== ''
	const validateEndDate =
		endDate >= startDate && startDate !== '' && endDate !== ''

	const receiptsAdvertiser = selectedByPropsOrParams
		? [selectedByPropsOrParams]
		: selectedCampaigns

	const receipts = side === 'publisher' ? dates : receiptsAdvertiser

	const monthMapping = useSelector(() =>
		selectReceiptMonths(created, Date.now())
	)

	const fetchingPublisherReceiptsSpinner = useSelector(state =>
		selectSpinnerById(state, FETCHING_PUBLISHER_RECEIPTS)
	)

	useEffect(() => {
		return () => {
			execute(resetSelectedItems())
		}
	}, [])

	useEffect(() => {
		console.log(
			'fetchingPublisherReceiptsSpinner',
			fetchingPublisherReceiptsSpinner
		)
	}, [fetchingPublisherReceiptsSpinner])

	useEffect(() => {
		if (validateStartDate && validateEndDate) {
			execute(getReceiptData(startDate, endDate))
		}
	}, [startDate, endDate, validateStartDate, validateEndDate])

	if (side === 'advertiser' && receipts.length === 0)
		return <Redirect to={'/dashboard/advertiser/campaigns'} />
	console.log('receipts', receipts)
	return (
		<Box display='flex' justifyContent='center' alignContent='center'>
			<Box
				display='flex'
				justifyContent='center'
				alignContent='center'
				flexDirection='column'
			>
				<CompanyDetails>
					<Box mt={2}>
						<ReactToPrint
							trigger={() => (
								<Button
									startIcon={<Print />}
									variant='contained'
									color='primary'
									fullWidth
								>
									{!selectedByPropsOrParams
										? `${t('RECEIPTS_PRINT_ALL')}`
										: `${t('RECEIPT_PRINT')}`}
								</Button>
							)}
							content={() => invoice.current}
						/>
					</Box>
				</CompanyDetails>
				{side === 'publisher' && (
					<Paper>
						<Box p={2} display='flex' justifyContent='space-between'>
							<Box m={1} display='flex' flex={1}>
								<Dropdown
									fullWidth
									source={[...monthMapping]}
									onChange={val => setStartDate(val)}
									error={!validateStartDate}
									value={startDate}
									label={t('START_DATE')}
									name='startDate'
									htmlId='start-date-select'
									IconComponent={CalendarToday}
								/>
							</Box>
							<Box m={1} display='flex' flex={1}>
								<Dropdown
									fullWidth
									source={[...monthMapping]}
									onChange={val => setEndDate(val)}
									error={!validateEndDate}
									value={endDate}
									label={t('END_DATE')}
									name='endDate'
									htmlId='end-date-select'
									IconComponent={CalendarToday}
								/>
							</Box>
						</Box>
						{fetchingPublisherReceiptsSpinner && (
							<LinearProgress className={classes.progress} />
						)}
					</Paper>
				)}
				<Card>
					<Box className={classnames(classes.hideOnDesktop)}>
						<Box
							p={5}
							display='flex'
							justifyContent='center'
							alignItems='center'
							flexDirection='column'
						>
							<Visibility />
							<Typography variant='overline' display='block' gutterBottom>
								{t('RECEIPT_PREVIEW_ONLY_DESKTOP')}
							</Typography>
						</Box>
					</Box>
					<Box className={classnames(classes.hideOnMobile)}>
						{receipts.length > 0 && (
							<Box ref={invoice} className={classnames(classes.a4)}>
								{receipts.map(item =>
									side === 'advertiser' ? (
										<CampaignReceiptTpl campaignId={item} key={item} />
									) : (
										fetchingPublisherReceiptsSpinner === false && (
											<PublisherReceiptTpl date={item.value} key={item.value} />
										)
									)
								)}
							</Box>
						)}
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { Receipt }
