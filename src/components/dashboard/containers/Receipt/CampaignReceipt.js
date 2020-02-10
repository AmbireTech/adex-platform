import React, { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Box, Card, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import classnames from 'classnames'
import { Print } from '@material-ui/icons'
import Receipt from './Receipt'
import CompanyDetails from './CompanyDetails'

const useStyles = makeStyles(theme => {
	return {}
})
function CampaignReceipt(props) {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId } = useParams()
	//TODO: check if campaings are finished
	// maybe in Receipt component

	const receipts = props.items || [props.itemId || itemId]
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
									Print Receipts
								</Button>
							)}
							content={() => invoice.current}
						/>
					</Box>
				</CompanyDetails>
				<Card className={classnames(classes.hideOnMobile)}>
					<Box ref={invoice}>
						{receipts.map(campaignId => (
							<Receipt campaignId={campaignId} />
						))}
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
