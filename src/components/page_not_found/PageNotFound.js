import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IMG_404 from 'resources/404.png'
import Img from 'components/common/img/Img'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { withStyles } from '@material-ui/core/styles'
import Translate from 'components/translate/Translate'
import { styles } from './styles'

const RRButton = withReactRouterLink(Button)

class PageNotFound extends React.Component {
	render() {
		const {
			t,
			classes,
			title,
			subtitle,
			goToTxt,
			goToPath,
			skipGoToButton,
		} = this.props
		return (
			<div className={classes.wrapper}>
				<Grid container spacing={2} justify='center' alignItems='center'>
					<Grid item sm={12}>
						<Typography className={classes.text} variant='h3'>
							{t(title || '404_TEXT')}
						</Typography>

						{subtitle && (
							<Typography className={classes.text} variant='subtitle1'>
								{t(subtitle)}
							</Typography>
						)}
					</Grid>

					<Grid item sm={12}>
						<Typography
							inline
							className={classes.text}
							variant='h1'
							style={{ textTransform: 'uppercase' }}
						>
							{t('404')}
						</Typography>
					</Grid>

					<Grid item sm={12}>
						<Img
							src={IMG_404}
							alt={'Downlad metamask'}
							className={classes.img}
						/>
					</Grid>

					<Grid item sm={12}>
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
}

PageNotFound.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	goToTxt: PropTypes.string,
	goToPath: PropTypes.string,
	skipGoToButton: PropTypes.bool,
}

export default Translate(withStyles(styles)(PageNotFound))
