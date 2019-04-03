import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Logo from 'components/common/icons/AdexIconTxt'
import Translate from 'components/translate/Translate'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
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
							<div className={classes.adexLogoTop} >
								<Logo className={classes.logo} />
							</div>
							<div>
								<Dialog
									open={true}
									classes={{
										paper:
											classnames(
												classes.dialogPaper,
												{
													[classes.noBg]: noBackground
												})
									}}
									BackdropProps={{
										classes: {
											root: classes.backdrop
										}
									}}
									fullWidth
									maxWidth='md'
								>
									<DialogContent
										classes={{ root: classes.content }}
									>
										<Decorated
											{...rest}
										/>
									</DialogContent>

								</Dialog>
							</div>
							<small className={classes.adxVersion} >
								v.{packageJson.version}-beta
  					</small>
						</div>
					</div>
				</div>
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