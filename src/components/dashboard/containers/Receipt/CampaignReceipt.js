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
function CampaignReceipt() {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId } = useParams()

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
						{/* TODO: render multiple receipts */}
						<Receipt campaignId={itemId} />
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
