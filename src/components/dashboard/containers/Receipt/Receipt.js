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
	selectAccountIdentityDeployData,
	selectReceiptMonths,
} from 'selectors'
import { execute, resetSelectedItems } from 'actions'
import Dropdown from 'components/common/dropdown'

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
	}
})
function Receipt(props) {
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

	const classes = useStyles()
	const invoice = useRef()
	const { itemId, date } = useParams()
	const side = useSelector(selectSide)
	const selectedCampaigns = useSelector(state => selectSelectedCampaigns(state))
	const selectedPublisherReceipts = useSelector(state =>
		selectSelectedPublisherReceipts(state)
	)

	const selectedByPropsOrParams = props.itemId || itemId || date
	const selectedItems =
		selectedCampaigns.length > 0 ? selectedCampaigns : selectedPublisherReceipts
	const dates = useSelector(() => selectReceiptMonths(startDate, endDate))
	const receiptsAdvertiser = selectedByPropsOrParams
		? [selectedByPropsOrParams]
		: selectedItems

	const receipts = side === 'publisher' ? dates : receiptsAdvertiser
	const { created } = useSelector(state =>
		selectAccountIdentityDeployData(state)
	)
	const monthMapping = useSelector(() =>
		selectReceiptMonths(created, Date.now())
	)

	useEffect(() => {
		return () => {
			execute(resetSelectedItems())
		}
	}, [])

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
									value={endDate}
									label={t('END_DATE')}
									name='endDate'
									htmlId='end-date-select'
									IconComponent={CalendarToday}
								/>
							</Box>
						</Box>
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
										<PublisherReceiptTpl date={item} key={item} />
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
