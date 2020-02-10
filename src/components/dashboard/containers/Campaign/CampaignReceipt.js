import React, { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { execute, updateCompanyData } from 'actions'
import { Box, Card, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import { selectCompanyData } from 'selectors'
import classnames from 'classnames'
import { Print } from '@material-ui/icons'
import TextFieldDebounced from 'components/common/fields/TextFieldDebounced'
import Receipt from './Receipt'

const useStyles = makeStyles(theme => {
	return {}
})
function CampaignReceipt() {
	const classes = useStyles()
	const invoice = useRef()
	const { itemId } = useParams()
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
				<Box mb={3}>
					<Box mb={1}>
						<Typography variant='h4'>{'Company Details'}</Typography>
					</Box>
					<Card>
						<Box p={3}>
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
						</Box>
					</Card>
				</Box>

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
