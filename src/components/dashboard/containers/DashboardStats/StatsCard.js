import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { styles } from './styles'
import classnames from 'classnames'

const StatsCard = props => {
	const { classes, title, subtitle, linkCard, children, onClick } = props

	return (
		<Card
			// raised
			className={classnames(classes.infoCard,
				{ [classes.linkCard]: !!linkCard })
			}
			onClick={onClick}
		>
			<CardContent>
				{title &&
                    <Typography
                    	variant="headline"
                    	component="h2"
                    	noWrap
                    >
                    	{title}
                    </Typography>
				}

				{subtitle &&
                    <Typography component="p" noWrap>
                    	{subtitle}
                    </Typography>
				}
				{children}
			</CardContent>
		</Card>
	)
}

StatsCard.propTypes = {
	classes: PropTypes.object.isRequired,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	linkCard: PropTypes.bool
}

export default withStyles(styles)(StatsCard)