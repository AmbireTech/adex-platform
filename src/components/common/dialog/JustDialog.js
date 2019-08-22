import React from 'react'
import PropTypes from 'prop-types'
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

	JustDialog.propTypes = {
		btnLabel: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		floating: PropTypes.bool,
	}

	return JustDialog
}
