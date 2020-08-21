import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	IconButton,
	Tooltip,
	Box,
	Button,
	CircularProgress,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Refresh, Receipt, Print } from '@material-ui/icons'
import { t, selectSpinnerById } from 'selectors'
import { PRINTING_CAMPAIGNS_RECEIPTS } from 'constants/spinners'

const useStyles = makeStyles(theme => ({
	wrapper: {
		margin: theme.spacing(1),
		position: 'relative',
	},
	buttonProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
}))

export function ReloadData({ handleReload }) {
	return (
		<Fragment>
			<Tooltip arrow title={t('RELOAD_DATA')}>
				<IconButton onClick={handleReload}>
					<Refresh />
				</IconButton>
			</Tooltip>
		</Fragment>
	)
}

export function ViewAllReceipts({ handleViewAllReceipts }) {
	return (
		<Fragment>
			<Tooltip arrow title={t('VIEW_ALL_RECEIPTS_DATA')}>
				<IconButton onClick={handleViewAllReceipts}>
					<Receipt />
				</IconButton>
			</Tooltip>
		</Fragment>
	)
}

export function PrintAllReceipts({ handlePrintAllReceipts, disabled }) {
	const classes = useStyles()
	const receiptsSpinner = useSelector(state =>
		selectSpinnerById(state, PRINTING_CAMPAIGNS_RECEIPTS)
	)

	return (
		<Fragment>
			<Tooltip arrow title={t('RECEIPTS_PRINT_ALL')}>
				<Box ml={2} mr={2}>
					<div className={classes.wrapper}>
						<Button
							startIcon={<Print />}
							onClick={handlePrintAllReceipts}
							variant='contained'
							color='primary'
							disabled={disabled || receiptsSpinner}
						>
							{t('RECEIPTS_PRINT_ALL')}
						</Button>
						{receiptsSpinner && (
							<CircularProgress size={24} className={classes.buttonProgress} />
						)}
					</div>
				</Box>
			</Tooltip>
		</Fragment>
	)
}
