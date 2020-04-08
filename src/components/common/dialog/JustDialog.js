import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import { styles } from './styles'

const useStyles = makeStyles(styles)

export default function DialogHoc(Decorated) {
	function JustDialog({ ...rest }) {
		const classes = useStyles()

		return (
			<Dialog open={true} classes={{ paper: classes.dialog }}>
				<DialogContent classes={{ root: classes.content }}>
					<Decorated {...rest} />
				</DialogContent>
			</Dialog>
		)
	}

	return JustDialog
}
