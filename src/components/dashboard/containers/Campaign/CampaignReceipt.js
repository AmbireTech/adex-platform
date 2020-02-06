import React, { useRef } from 'react'
import { useParams } from 'react-router'
import { Box, Card, Button, Typography, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import ReactToPrint from 'react-to-print'
import { t } from 'selectors'
import classnames from 'classnames'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'

const useStyles = makeStyles(theme => {
	return {
		a4: {
			width: '210mm',
			minHeight: '297mm',
			padding: '8mm',
		},
		icon: {
			height: '3rem',
			width: 'auto',
		},
		dottedDivider: {
			border: `0.5px dotted ${theme.palette.grey.main}`,
		},
	}
})
function CampaignReceipt() {
	const classes = useStyles()
	const { itemId } = useParams()
	const invoice = useRef()

	return (
		<Box display='flex' justifyContent='center' alignContent='center'>
			<Box
				display='flex'
				justifyContent='center'
				alignContent='center'
				flexDirection='column'
			>
				<Box>
					<ReactToPrint
						trigger={() => <Button>Print</Button>}
						content={() => invoice.current}
					/>
				</Box>
				<Card ref={invoice} className={classnames(classes.a4)}>
					<Box mb={2} display='flex' justifyContent='space-between'>
						<Box>
							<Typography variant='h4'>{`Invoice for XXX`}</Typography>
							<Typography variant='h5'>{`Account ID: XXX`}</Typography>
							<Typography variant='body2'>{`Invoice ID: XXX`}</Typography>
						</Box>
						<Box>
							<AdexIconTxt className={classnames(classes.icon)} />
						</Box>
					</Box>
					<Divider />
					<Box
						mt={5}
						display='flex'
						justifyContent='space-between'
						alignContent='center'
					>
						<Box display='flex' flexDirection='column'>
							<Box mb={2}>
								<Typography variant='subtitle2'>
									<strong>{`Company Details`}</strong>
								</Typography>
								<Typography variant='body2'>{`My Cool Company Ltd.`}</Typography>
								<Typography variant='body2'>{`First Last Name`}</Typography>
								<Typography variant='body2'>{`Address`}</Typography>
								<Typography variant='body2'>{`Country`}</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant='body2'>{`Invoice/payment date`}</Typography>
								<Typography variant='subtitle2'>
									<strong>{`31 Aug 2017, 11:12`}</strong>
								</Typography>
							</Box>
							<Box mb={2}>
								<Typography variant='body2'>{`Campaign ID`}</Typography>
								<Typography variant='subtitle2'>
									<strong>{itemId}</strong>
								</Typography>
							</Box>
						</Box>
						<Box display='flex' flexDirection='column' alignItems='flex-end'>
							<Typography variant='h6'>{`Paid`}</Typography>
							<Typography variant='h4'>
								<strong>{`ETH XXX`}</strong>
							</Typography>
							<Typography variant='p'>{`Total cost in USD ($XXX)`}</Typography>
						</Box>
					</Box>
					<Box display='flex' justifyContent='space-between'>
						<Box>
							<Typography variant='h6'>{`Campaign Details`}</Typography>
						</Box>
					</Box>
					<Divider className={classnames(classes.dottedDivider)} />
					<Box mt={2} display='flex' justifyContent='space-between'>
						<Box>
							<Typography variant='body2'>
								{'From 2020-02-02 19:28, to 2020-03-31 19:28'}
							</Typography>
						</Box>
						<Box>
							<Typography variant='subtitle2'>
								<strong>{'XXX ETH'}</strong>
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
								<strong>{'XXX'}</strong>
							</Typography>
						</Box>
					</Box>
					<Box mt={2} display='flex' justifyContent='space-between'>
						<Box>
							<Typography variant='body2'>{t('LABEL_CLICKS')}</Typography>
						</Box>
						<Box>
							<Typography variant='subtitle2'>
								<strong>{'XXX'}</strong>
							</Typography>
						</Box>
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
export { CampaignReceipt }
