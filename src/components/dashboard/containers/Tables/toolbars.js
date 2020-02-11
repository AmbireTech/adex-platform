import React, { Fragment } from 'react'
import { IconButton, Tooltip, Box, Button } from '@material-ui/core'
import { Refresh, Receipt, Print } from '@material-ui/icons'
import { t } from 'selectors'

export function ReloadData({ handleReload }) {
	return (
		<Fragment>
			<Tooltip title={t('RELOAD_DATA')}>
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
			<Tooltip title={t('VIEW_ALL_RECEIPTS_DATA')}>
				<IconButton onClick={handleViewAllReceipts}>
					<Receipt />
				</IconButton>
			</Tooltip>
		</Fragment>
	)
}

export function PrintAllReceipts({ handlePrintAllReceipts, disabled }) {
	return (
		<Fragment>
			<Tooltip title={t('RECEIPTS_PRINT_ALL')}>
				<Box ml={2} mr={2}>
					<Button
						startIcon={<Print />}
						onClick={handlePrintAllReceipts}
						variant='contained'
						color='primary'
						disabled={disabled}
					>
						{t('RECEIPTS_PRINT_ALL')}
					</Button>
				</Box>
			</Tooltip>
		</Fragment>
	)
}
