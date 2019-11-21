import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

function arrowGenerator(color) {
	return {
		'&[x-placement*="bottom"] $arrow': {
			top: 0,
			left: 0,
			marginTop: '-0.95em',
			width: '2em',
			height: '1em',
			'&::before': {
				borderWidth: '0 1em 1em 1em',
				borderColor: `transparent transparent ${color} transparent`,
			},
		},
		'&[x-placement*="top"] $arrow': {
			bottom: 0,
			left: 0,
			marginBottom: '-0.95em',
			width: '2em',
			height: '1em',
			'&::before': {
				borderWidth: '1em 1em 0 1em',
				borderColor: `${color} transparent transparent transparent`,
			},
		},
		'&[x-placement*="right"] $arrow': {
			left: 0,
			marginLeft: '-0.95em',
			height: '2em',
			width: '1em',
			'&::before': {
				borderWidth: '1em 1em 1em 0',
				borderColor: `transparent ${color} transparent transparent`,
			},
		},
		'&[x-placement*="left"] $arrow': {
			right: 0,
			marginRight: '-0.95em',
			height: '2em',
			width: '1em',
			'&::before': {
				borderWidth: '1em 0 1em 1em',
				borderColor: `transparent transparent transparent ${color}`,
			},
		},
	}
}

export const LightTooltip = withStyles(theme => ({
	tooltip: {
		backgroundColor: theme.palette.common.white,
		color: 'rgba(0, 0, 0, 0.87)',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	},
}))(Tooltip)

const useStylesArrow = makeStyles(theme => ({
	tooltip: {
		position: 'relative',
		backgroundColor: theme.palette.common.black,
	},
	popper: arrowGenerator(theme.palette.common.black),
	arrow: {
		position: 'absolute',
		fontSize: 6,
		'&::before': {
			content: '""',
			margin: 'auto',
			display: 'block',
			width: 0,
			height: 0,
			borderStyle: 'solid',
		},
	},
}))

export function ArrowTooltip(props) {
	const { arrow, ...classes } = useStylesArrow()
	const [arrowRef, setArrowRef] = React.useState(null)

	return (
		<Tooltip
			classes={classes}
			PopperProps={{
				popperOptions: {
					modifiers: {
						arrow: {
							enabled: Boolean(arrowRef),
							element: arrowRef,
						},
					},
				},
			}}
			{...props}
			title={
				<React.Fragment>
					{props.title}
					<span className={arrow} ref={setArrowRef} />
				</React.Fragment>
			}
		/>
	)
}

ArrowTooltip.propTypes = {
	title: PropTypes.node,
}

export const HtmlTooltip = withStyles(theme => ({
	tooltip: {
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(12),
		border: '1px solid #dadde9',
	},
}))(Tooltip)
