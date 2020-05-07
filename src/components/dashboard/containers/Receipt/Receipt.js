import React, { useRef, useEffect, useState } from 'react'
import { useParams, Redirect } from 'react-router'
import { Box, Hidden, Button, Typography, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print, Visibility, DateRangeSharp, GetApp } from '@material-ui/icons'
import { PublisherReceiptTpl } from './PublisherReceiptTpl'
import { CampaignReceiptTpl } from './CampaignReceiptTpl'
import CompanyDetails from './CompanyDetails'
import { useSelector } from 'react-redux'
import {
	t,
	selectSelectedCampaigns,
	selectSide,
	selectSpinnerById,
	selectAccountIdentityDeployData,
	selectReceiptMonths,
} from 'selectors'
import { execute, resetSelectedItems, getReceiptData } from 'actions'
import Dropdown from 'components/common/dropdown'
import { FETCHING_PUBLISHER_RECEIPTS } from 'constants/spinners'
import { LinearProgress } from '@material-ui/core'
import { styles } from './styles'
const useStyles = makeStyles(styles)

function Receipt(props) {
	const classes = useStyles()
	const invoice = useRef()
	const side = useSelector(selectSide)
	// Advertiser Receipt variables
	const { itemId } = useParams()
	const selectedCampaigns = useSelector(state => selectSelectedCampaigns(state))
	const selectedByPropsOrParams = props.itemId || itemId
	const receiptsAdvertiser = selectedByPropsOrParams
		? [selectedByPropsOrParams]
		: selectedCampaigns

	// Publisher Receipt variables
	const { created } = useSelector(state =>
		selectAccountIdentityDeployData(state)
	)
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [dirty, setDirty] = useState(false)
	const dates = useSelector(() => selectReceiptMonths(startDate, endDate))
	const validateStartDate =
		startDate <= endDate && startDate !== '' && endDate !== ''
	const validateEndDate =
		endDate >= startDate && startDate !== '' && endDate !== ''
	const startDateError = !validateStartDate && dirty
	const endDateError = !validateEndDate && dirty
	const monthMappingStartPeriod = useSelector(() =>
		selectReceiptMonths(created, new Date().setDate(0), false)
	)
	const monthMappingEndPeriod = useSelector(() =>
		selectReceiptMonths(created, new Date().setDate(0), true)
	)

	const fetchingPublisherReceiptsSpinner = useSelector(state =>
		selectSpinnerById(state, FETCHING_PUBLISHER_RECEIPTS)
	)

	// Receipts
	const [receipts, setReceipts] = useState(receiptsAdvertiser || [])

	useEffect(() => {
		return () => {
			execute(resetSelectedItems())
		}
	}, [])

	const getReceipts = () => {
		setDirty(true)
		if (validateStartDate && validateEndDate) {
			execute(getReceiptData(startDate, endDate))
			setReceipts(dates.map(item => item.value))
		}
	}

	if (side === 'advertiser' && receipts.length === 0)
		return <Redirect to={'/dashboard/advertiser/campaigns'} />
	return (
		<Box display='flex' justifyContent='center' alignContent='center'>
			<Box
				display='flex'
				justifyContent='center'
				alignContent='center'
				flexDirection='column'
			>
				<CompanyDetails>
					<ReactToPrint
						trigger={() => (
							<Button
								startIcon={<Print />}
								variant='contained'
								color='primary'
								disabled={
									side === 'publisher' &&
									(receipts.length === 0 || fetchingPublisherReceiptsSpinner)
								}
								fullWidth
							>
								{!selectedByPropsOrParams
									? `${t('RECEIPTS_PRINT_ALL')}`
									: `${t('RECEIPT_PRINT')}`}
							</Button>
						)}
						content={() => invoice.current}
					/>
				</CompanyDetails>
				{side === 'publisher' && (
					<Paper variant='outlined'>
						<Box
							p={1}
							display='flex'
							justifyContent='space-between'
							alignItems='flex-start'
							flexDirection='row'
							flexWrap='wrap'
						>
							<Box m={1} display='flex' flex={1}>
								<Dropdown
									variant='outlined'
									fullWidth
									source={[...monthMappingStartPeriod]}
									onChange={val => {
										setDirty(true)
										setStartDate(val)
									}}
									error={startDateError}
									helperText={
										startDateError && startDate !== ''
											? t('START_DATE_ERROR')
											: t('HELPER_START_DATE')
									}
									value={startDate}
									label={t('START_PERIOD')}
									name='startDate'
									htmlId='start-date-select'
									IconComponent={DateRangeSharp}
								/>
							</Box>
							<Box m={1} display='flex' flex={1}>
								<Dropdown
									variant='outlined'
									fullWidth
									source={[...monthMappingEndPeriod]}
									onChange={val => {
										setDirty(true)
										setEndDate(val)
									}}
									error={endDateError}
									helperText={
										endDateError && endDate !== ''
											? t('END_DATE_ERROR')
											: t('HELPER_END_DATE')
									}
									value={endDate}
									label={t('END_PERIOD')}
									name='endDate'
									htmlId='end-date-select'
									IconComponent={DateRangeSharp}
								/>
							</Box>
							<Box m={1} display='flex' flex={1}>
								<Button
									fullWidth
									startIcon={<GetApp />}
									variant='contained'
									color='primary'
									onClick={() => getReceipts()}
								>
									{t('GET_RECEIPTS')}
								</Button>
							</Box>
						</Box>
						{fetchingPublisherReceiptsSpinner && (
							<LinearProgress className={classes.progress} />
						)}
					</Paper>
				)}
				<Box mt={2}>
					<Hidden mdUp>
						<Paper variant='outlined'>
							<Box
								p={2}
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
						</Paper>
					</Hidden>
					<Hidden smDown>
						{receipts.length > 0 && (
							<Paper variant='outlined'>
								<Box ref={invoice} className={classnames(classes.a4)}>
									{receipts.map(item =>
										side === 'advertiser' ? (
											<CampaignReceiptTpl campaignId={item} key={item} />
										) : (
											fetchingPublisherReceiptsSpinner === false && (
												<PublisherReceiptTpl date={item} key={item} />
											)
										)
									)}
								</Box>
							</Paper>
						)}
					</Hidden>
				</Box>
			</Box>
		</Box>
	)
}
export { Receipt }
