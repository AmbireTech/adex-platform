import React, { useRef } from 'react'
import { useParams, Redirect } from 'react-router'
import { Box, Card, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print, Visibility } from '@material-ui/icons'
import { CampaignReceiptTpl } from './ReceiptTemplates'
import CompanyDetails from './CompanyDetails'
import { useSelector } from 'react-redux'
import { t, selectSelectedCampaigns } from 'selectors'

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
function CampaignReceipt(props) {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId } = useParams()
	const items = useSelector(state => selectSelectedCampaigns(state))
	// TODO: render back button
	const selectedByPropsOrParams = props.itemId || itemId
	const receipts = selectedByPropsOrParams ? [selectedByPropsOrParams] : items
	if (receipts.length === 0)
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
								{receipts.map(campaignId => (
									<CampaignReceiptTpl
										campaignId={campaignId}
										key={campaignId}
									/>
								))}
							</Box>
						)}
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
