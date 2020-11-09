import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import { CheckCircle } from '@material-ui/icons'
import StepConnector from '@material-ui/core/StepConnector'

const LINES_WIDTH = 3
const DEFAULT_SIZE = 80

const useColorlibStepIconStyles = makeStyles(theme => ({
	root: {
		backgroundColor: 'transparent',
		zIndex: 1,
		width: props => DEFAULT_SIZE,
		height: props => DEFAULT_SIZE,
		display: 'flex',
		borderRadius: '50%',
		justifyContent: 'center',
		alignItems: 'center',
		border: `${LINES_WIDTH}px solid ${theme.palette.text.solid}`,
		transition: '0.5s',
		'&:hover': {
			boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
			transform: 'translateY(-5px)',
		},
	},
	active: {
		border: `${LINES_WIDTH}px solid ${theme.palette.primary.main} !important`,
	},
	completed: {
		border: `${LINES_WIDTH}px solid ${theme.palette.accentTwo.main}`,
	},
	star: {
		position: 'relative',
		backgroundColor: theme.palette.accentTwo.contrastText,
		color: theme.palette.accentTwo.main,
		top: '-40%',
		right: '-32%',
		borderRadius: '50%',
	},
}))

export const ColorlibConnector = withStyles(theme => ({
	alternativeLabel: {
		top: DEFAULT_SIZE / 2,
		left: `calc(-50% + ${DEFAULT_SIZE / 2}px)`,
		right: `calc(50% + ${DEFAULT_SIZE / 2}px)`,
	},
	line: {
		height: LINES_WIDTH,
		border: 0,
		background: `linear-gradient(to right, transparent 50%, ${theme.palette.background.paper} 50%), ${theme.palette.text.solid}`,
		backgroundSize: `${LINES_WIDTH * 5}px`,
	},
}))(StepConnector)

export function ColorlibStepIcon(props) {
	const classes = useColorlibStepIconStyles(props)
	const { active, completed, icon } = props

	return (
		<Box
			className={clsx(classes.root, {
				[classes.completed]: completed,
				[classes.active]: active,
			})}
			style={{
				backgroundImage: `url(${icon})`,
				backgroundSize: 'cover',
			}}
		>
			{completed && <CheckCircle className={clsx(classes.star)} />}
		</Box>
	)
}

ColorlibStepIcon.propTypes = {
	active: PropTypes.bool,
	completed: PropTypes.bool,
	icon: PropTypes.node,
}
