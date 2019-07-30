import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Logo from 'components/common/icons/AdexIconTxt'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import classnames from 'classnames'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export default function ConnectHoc(Decorated) {
	class Connect extends Component {

		render() {
			const { classes, t, noBackground, ...rest } = this.props
			return (
				<div
					className={classes.signinContainer}
					style={{ backgroundImage: `url(${require('resources/background.png')})` }}
				>
					<div className={classes.container}>
						<div className="adex-dapp">
							<Grid container className={classes.root} spacing={2}>
								<Grid item xs={12} md={8}>
									<div className={classes.adexLogoTop} >
										<Logo className={classes.logo} />
									</div>
									<small className={classes.adxVersion} >
										{`v.${packageJson.version}-beta`}
									</small>
								</Grid>
								<Grid item xs={12} md={4}>
									<Decorated
										{...rest}
									/>
								</Grid>
							</Grid>

						</div>
					</div>
				</div >
			)
		}
	}

	Connect.propTypes = {
		actions: PropTypes.object.isRequired,
	}

	function mapStateToProps(state) {
		// const persist = state.persist
		// const memory = state.memory
		return {
			// account: persist.account
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch)
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(withStyles(styles)(Connect)))
}