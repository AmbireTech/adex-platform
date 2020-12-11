import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, Fab } from '@material-ui/core'
import { Check, Save } from '@material-ui/icons'
import clsx from 'clsx'

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
		color: theme.palette.grey.main,
	},
	'@keyframes pulse': {
		'0%': {
			opacity: 1,
			transform: 'scale(1)',
		},
		'50%': {
			opacity: 0,
			transform: 'scale(1.420)',
		},
		'100%': {
			opacity: 0,
			transform: 'scale(1.420)',
		},
	},
	pulse: {
		overflow: 'visible',
		position: 'relative',
		'&::before': {
			content: '""',
			display: 'block',
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0,
			backgroundColor: 'inherit',
			borderRadius: 'inherit',
			transition: 'opacity .3s, transform .3s',
			animation: '$pulse 1.69s cubic-bezier(0.23, 0, 0.420, 1) infinite',
		},
	},
})

const useStyles = makeStyles(styles)

export const SaveBtn = ({
	spinner,
	success,
	dirtyProps = [],
	validations,
	save,
	disabled,
}) => {
	const classes = useStyles()
	const hasErrors = !!Object.keys(validations).length
	const isDisabled = disabled || spinner || !dirtyProps.length || hasErrors
	return (
		!!dirtyProps.length && (
			<div className={classes.wrapper}>
				<Fab
					className={clsx(classes.wrapper, {
						[classes.pulse]: !isDisabled,
					})}
					size='medium'
					color='secondary'
					onClick={save}
					disabled={isDisabled}
				>
					{/*TODO: Success */}
					{success ? <Check /> : <Save />}
				</Fab>
				{!!spinner && (
					<CircularProgress
						size={58}
						className={classes.fabProgress}
						color='inherit'
					/>
				)}
			</div>
		)
	)
}
