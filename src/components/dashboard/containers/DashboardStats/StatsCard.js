import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { styles } from './styles'
import classnames from 'classnames'
import { LoadingSection } from 'components/common/spinners'
import InfoIcon from '@material-ui/icons/Info'
import { BootstrapTooltip } from 'components/common/tooltips'

const StatsCard = props => {
	const {
		classes,
		title,
		subtitle,
		linkCard,
		children,
		onClick,
		bgColor,
		loading,
		textColor,
		subtitleStyle,
		explain,
	} = props

	return (
		<Card
			style={bgColor}
			// raised
			className={classnames(classes.infoCard, {
				[classes.linkCard]: !!linkCard,
			})}
			onClick={onClick}
		>
			<LoadingSection loading={loading}>
				<CardContent>
					{title && (
						<Typography style={textColor} variant='h5' noWrap>
							{title}
						</Typography>
					)}
					{subtitle && (
						<Typography
							style={{ ...textColor, ...subtitleStyle }}
							component='p'
							noWrap
						>
							{subtitle}{' '}
							{explain && (
								<BootstrapTooltip
									title={
										<Typography
											style={textColor}
											component='p'
											variant='caption'
										>
											{explain}
										</Typography>
									}
								>
									<InfoIcon style={{ ...textColor, fontSize: 12 }}></InfoIcon>
								</BootstrapTooltip>
							)}
						</Typography>
					)}
					{children}
				</CardContent>
			</LoadingSection>
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
