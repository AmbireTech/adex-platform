import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import { Stars } from '@material-ui/icons'
import { PRIMARY, SECONDARY } from 'components/App/themeMUi'
import StepConnector from '@material-ui/core/StepConnector'

const useColorlibStepIconStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.common.white,
		zIndex: 1,
		width: props => props.size || 100,
		height: props => props.size || 100,
		display: 'flex',
		borderRadius: '50%',
		justifyContent: 'center',
		alignItems: 'center',
		border: `3px solid ${theme.palette.grey[300]}`,
		transition: '0.5s',
		'&:hover': {
			boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
			transform: 'translateY(-5px)',
		},
	},
	active: {
		border: `3px solid ${PRIMARY} !important`,
	},
	completed: {
		border: `3px solid ${SECONDARY}`,
	},
	star: {
		position: 'relative',
		backgroundColor: theme.palette.common.white,
		top: '-40%',
		right: '-35%',
		borderRadius: '50%',
	},
}))

export const ColorlibConnector = withStyles(theme => ({
	alternativeLabel: {
		top: 50,
	},
	line: {
		height: 3,
		border: 0,
		background: `linear-gradient(to right, transparent 50%, #fff 50%), ${
			theme.palette.grey[300]
		}`,
		backgroundSize: `16px 2px, 100% 2px`,
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
			{completed && <Stars className={clsx(classes.star)} color='secondary' />}
		</Box>
	)
}

ColorlibStepIcon.propTypes = {
	active: PropTypes.bool,
	completed: PropTypes.bool,
	icon: PropTypes.node,
}
