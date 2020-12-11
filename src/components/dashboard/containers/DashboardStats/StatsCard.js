import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Typography } from '@material-ui/core'
import classnames from 'classnames'
import { ArrowTooltip } from 'components/common/tooltips'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Info, Visibility, VisibilityOff } from '@material-ui/icons'

const useStyles = makeStyles(theme => {
	return {
		root: {
			cursor: 'pointer',
			position: 'relative',
			backgroundColor: ({ bgColor = '' }) =>
				(theme.palette[bgColor] || {}).main || theme.palette.background.default,
			color: ({ bgColor = '' }) =>
				(theme.palette[bgColor] || {}).contrastText ||
				theme.palette.text.primary,
		},
		infoCard: {
			flexGrow: 1,
		},
		linkCard: {
			'&:hover, &:focus': {
				cursor: 'pointer',
			},
		},
		progress: {
			bottom: 0,
			left: 0,
			position: 'absolute',
			width: '100%',
		},
		visibilityIcon: {
			color: theme.palette.common.white,
			position: 'absolute',
			top: theme.spacing(0.3),
			right: theme.spacing(0.5),
		},
	}
})

const StatsCard = props => {
	const {
		title,
		subtitle,
		linkCard,
		children,
		onClick,
		bgColor,
		loading,
		explain,
		dataVisible,
	} = props

	const classes = useStyles({ bgColor, dataVisible })

	const VIcon = dataVisible ? Visibility : VisibilityOff

	return (
		<Box
			overflow='hidden'
			p={1}
			variant='outlined'
			className={classnames(classes.root, {
				[classes.linkCard]: !!linkCard,
			})}
			onClick={onClick}
			display='flex'
			flexDirection='column'
			justifyContent='center'
			alignContent='stretch'
			flexWrap='wrap'
			flexGrow={1}
		>
			<Box>
				{children}
				<Box
					display='flex'
					flexDirection='row'
					justifyContent='flex-start'
					flexWrap='wrap'
					alignItems='center'
					pr={3}
				>
					{onClick && <VIcon className={classes.visibilityIcon} size='large' />}
					{title && (
						<Typography variant='h6' noWrap>
							{title}
						</Typography>
					)}
				</Box>

				{subtitle &&
					(explain ? (
						<ArrowTooltip
							title={
								<Typography component='div' variant='caption'>
									{explain}
								</Typography>
							}
						>
							<Typography component='div'>
								{subtitle} <Info style={{ fontSize: 12 }} />
							</Typography>
						</ArrowTooltip>
					) : (
						<Typography component='div'>{subtitle}</Typography>
					))}
			</Box>

			{loading && <LinearProgress className={classes.progress} />}
		</Box>
	)
}

StatsCard.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	linkCard: PropTypes.bool,
}

export default StatsCard
