import React, { useRef } from 'react'
import { useParams, Redirect } from 'react-router'
import { Box, Card, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print, Visibility } from '@material-ui/icons'
import { CampaignReceiptTpl, PublisherReceiptTpl } from './ReceiptTemplates'
import CompanyDetails from './CompanyDetails'
import { useSelector } from 'react-redux'
import { t, selectSelectedCampaigns, selectSide } from 'selectors'

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
	const classes = useStyles()
	const invoice = useRef()
	const { itemId, date } = useParams()
	const side = useSelector(selectSide)
	const selectedCampaigns = useSelector(state => selectSelectedCampaigns(state))
	// TODO: render back button
	const selectedByPropsOrParams = props.itemId || itemId || date
	const receipts = selectedByPropsOrParams
		? [selectedByPropsOrParams]
		: selectedCampaigns

	if (receipts.length === 0)
		return (
			<Redirect
				to={
					side === 'advertiser'
						? '/dashboard/advertiser/campaigns'
						: '/dashboard/publisher/receipts'
				}
			/>
		)
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
									itemId ? (
										<CampaignReceiptTpl campaignId={item} key={item} />
									) : (
										date && <PublisherReceiptTpl date={date} key={item} />
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
