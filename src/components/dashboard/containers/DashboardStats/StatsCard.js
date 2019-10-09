import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { styles } from './styles'
import classnames from 'classnames'

const StatsCard = props => {
	const {
		classes,
		title,
		subtitle,
		linkCard,
		loading,
		children,
		onClick,
	} = props

	return (
		<Card
			// raised
			className={classnames(classes.infoCard, {
				[classes.linkCard]: !!linkCard,
			})}
			onClick={onClick}
		>
			<Box display='flex' alignItems='center'>
				<Box>
					<CardContent>
						{title && (
							<Typography variant='h5' noWrap>
								{title}
							</Typography>
						)}

						{subtitle && (
							<Typography component='p' noWrap>
								{subtitle}
							</Typography>
						)}
						{children}
					</CardContent>
				</Box>
				<Box>{loading && <CircularProgress />}</Box>
			</Box>
		</Card>
	)
}

StatsCard.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	linkCard: PropTypes.bool,
}

export default withStyles(styles)(StatsCard)
