import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import classnames from 'classnames'
import InfoIcon from '@material-ui/icons/Info'
import { ArrowTooltip } from 'components/common/tooltips'
import LinearProgress from '@material-ui/core/LinearProgress'

const useStyles = makeStyles(theme => {
	return {
		root: {
			position: 'relative',
			backgroundColor: ({ bgColor = '' }) =>
				(theme.palette[bgColor] || {}).main || theme.palette.background.default,
			color: ({ bgColor = '' }) =>
				(theme.palette[bgColor] || {}).contrastText ||
				theme.palette.text.primary,
		},
		cardContent: {
			'&:last-child': {
				paddingBottom: 16, // Hard coded as component implementation
			},
		},
		infoCard: {
			margin: theme.spacing(1),
			flexGrow: 1,
		},
		linkCard: {
			'&:hover, &:focus': {
				cursor: 'pointer',
			},
		},
		progress: {
			bottom: 0,
			position: 'absolute',
			width: '100%',
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
	} = props

	const classes = useStyles({ bgColor })

	return (
		<Card
			// raised
			className={classnames(classes.root, classes.infoCard, {
				[classes.linkCard]: !!linkCard,
			})}
			onClick={onClick}
		>
			<CardContent classes={{ root: classes.cardContent }}>
				{title && (
					<Typography variant='h6' noWrap>
						{title}
					</Typography>
				)}
				{subtitle &&
					(explain ? (
						<ArrowTooltip
							title={
								<Typography component='div' variant='caption'>
									{explain}
								</Typography>
							}
						>
							<Typography component='div' noWrap>
								{subtitle} <InfoIcon style={{ fontSize: 12 }}></InfoIcon>
							</Typography>
						</ArrowTooltip>
					) : (
						<Typography component='div' noWrap>
							{subtitle}
						</Typography>
					))}
				{children}
			</CardContent>
			{loading && <LinearProgress className={classes.progress} />}
		</Card>
	)
}

StatsCard.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	linkCard: PropTypes.bool,
}

export default StatsCard
