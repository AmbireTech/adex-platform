import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, Fab } from '@material-ui/core'
import { Check, Save } from '@material-ui/icons'

export const styles = theme => ({
	root: {
		display: 'flex',
		alignItems: 'center',
	},
	wrapper: {
		position: 'relative',
	},
	buttonSuccess: {
		backgroundColor: theme.palette.success.main,
		color: theme.palette.success.contrastText,
		'&:hover': {
			backgroundColor: theme.palette.success.dark,
		},
	},
	fabProgress: {
		position: 'absolute',
		top: -5,
		left: -5,
		zIndex: 1,
	},
})

const useStyles = makeStyles(styles)

export const SaveBtn = ({
	spinner,
	success,
	dirtyProps = [],
	save,
	disabled,
}) => {
	const classes = useStyles()
	return (
		!!dirtyProps.length && (
			<div className={classes.wrapper}>
				<Fab
					size='medium'
					color='primary'
					onClick={save}
					disabled={disabled || spinner || !dirtyProps.length}
				>
					{/*TODO: Success */}
					{success ? <Check /> : <Save />}
				</Fab>
				{!!spinner && (
					<CircularProgress
						size={58}
						className={classes.fabProgress}
						color='secondary'
					/>
				)}
			</div>
		)
	)
}
