import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

const useStyles = makeStyles(theme => ({
	dialog: {
		height: '100vh',
		width: theme.maxWidth || 1200,
		maxWidth: '100%',
	},
}))

export default function DialogHoc(Decorated) {
	function JustDialog({ ...rest }) {
		const classes = useStyles()

		return (
			<Dialog open={true} classes={{ paper: classes.dialog }}>
				<DialogContent>
					<Decorated {...rest} />
				</DialogContent>
			</Dialog>
		)
	}

	return JustDialog
}
