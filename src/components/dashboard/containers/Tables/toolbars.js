import React, { Fragment } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import RefreshIcon from '@material-ui/icons/Refresh'
import { t } from 'selectors'

export function ReloadData({ handleReload }) {
	return (
		<Fragment>
			<Tooltip title={t('RELOAD_DATA')}>
				<IconButton onClick={handleReload}>
					<RefreshIcon />
				</IconButton>
			</Tooltip>
		</Fragment>
	)
}
