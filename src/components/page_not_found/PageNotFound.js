import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IMG_404_1 from 'resources/404-no.png'
import IMG_404_2 from 'resources/404-yes.png'
import Media from 'components/common/media'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { makeStyles } from '@material-ui/core/styles'

import { styles } from './styles'
import { t } from 'selectors'

const RRButton = withReactRouterLink(Button)

const G404 = ({ size }) => (
	<Grid item xs={size}>
		<Typography variant={`h${6 - size}`} style={{ textTransform: 'uppercase' }}>
			{t('404')}
		</Typography>
	</Grid>
)

const useStyles = makeStyles(styles)

const PageNotFound = ({
	title,
	subtitle,
	goToTxt,
	goToPath,
	skipGoToButton,
}) => {
	const classes = useStyles()
	return (
		<div className={classes.wrapper}>
			<Grid container spacing={2} justify='center' alignItems='center'>
				<Grid item xs={12}>
					<Typography className={classes.text} variant='h3' align='center'>
						{t(title || '404')}
					</Typography>

					{subtitle && (
						<Typography className={classes.text} variant='subtitle1'>
							{t(subtitle)}
						</Typography>
					)}
				</Grid>

				<G404 size={3} />
				<G404 size={4} />
				<G404 size={2} />
				<G404 size={1} />
				<G404 size={5} />
				<G404 size={3} />
				<G404 size={2} />

				<Grid item xs={5} sm={3}>
					<Media src={IMG_404_1} alt={'no'} className={classes.img} />
				</Grid>
				<Grid item xs={7} sm={9}>
					<Typography noWrap className={classes.text} variant='body1'>
						{window.location.href}
					</Typography>
					<Typography noWrap className={classes.text} variant='body1'>
						{window.location.href}
					</Typography>
					<Typography noWrap className={classes.text} variant='body1'>
						{window.location.href}
					</Typography>
					<Typography noWrap className={classes.text} variant='body1'>
						{window.location.href}
					</Typography>
				</Grid>
				<Grid item xs={5} sm={3}>
					<Media src={IMG_404_2} alt={'yes'} className={classes.img} />
				</Grid>
				<Grid item xs={7} sm={9}>
					{!skipGoToButton && (
						<RRButton
							variant='contained'
							to={goToPath || '/'}
							size='large'
							color='primary'
						>
							{t(goToTxt || 'GO_HOME')}
						</RRButton>
					)}
				</Grid>
			</Grid>
		</div>
	)
}

PageNotFound.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	goToTxt: PropTypes.string,
	goToPath: PropTypes.string,
	skipGoToButton: PropTypes.bool,
}

export default PageNotFound
