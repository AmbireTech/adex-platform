import React, { useRef } from 'react'
import { useParams } from 'react-router'
import { Box, Card, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print } from '@material-ui/icons'
import Receipt from './Receipt'
import CompanyDetails from './CompanyDetails'
import { useSelector } from 'react-redux'
import { selectSelectedItems } from 'selectors'

const useStyles = makeStyles(theme => {
	return {
		a4: {
			width: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
	}
})
function CampaignReceipt(props) {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId } = useParams()
	const items = useSelector(state => selectSelectedItems(state))
	//TODO: check if campaings are finished | maybe in Receipt component
	// TODO: render back button when habing itemId
	// TODO: hide receipts on smaller screens
	// TODO: redirect to campaigns if no items present
	const selectedByPropsOrParams = props.itemId || itemId
	const receipts = selectedByPropsOrParams ? [selectedByPropsOrParams] : items
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
									{props.items ? 'Print All Receipts' : 'Print Receipt'}
								</Button>
							)}
							content={() => invoice.current}
						/>
					</Box>
				</CompanyDetails>
				<Card className={classnames(classes.hideOnMobile)}>
					{receipts.length > 0 && (
						<Box ref={invoice} className={classnames(classes.a4)}>
							{receipts.map(campaignId => (
								<Receipt campaignId={campaignId} />
							))}
						</Box>
					)}
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
