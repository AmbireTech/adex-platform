import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Logo from 'components/common/icons/AdexIconTxt'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

import AuthSelect from 'components/signin/auth-select/AuthSelect'

export default function ConnectHoc(Decorated) {
	class Connect extends Component {
		render() {
			const { classes, t, noBackground, ...rest } = this.props
			return (
				<div className={classes.root}>
					<Grid
						className={classes.container}
						container
						alignItems='stretch'
						// spacing={2}
					>
						<Grid className={classes.actions} item xs={12} md={9}>
							<Box width={1} height={1} p={4}>
								<Box width={1} height={1} position='relative'>
									<Decorated t={t} {...rest} />
								</Box>
							</Box>
						</Grid>
						<Grid
							item
							container
							xs={12}
							md={3}
							alignItems='stretch'
							className={classes.buttons}
						>
							<Grid
								container
								direction='column'
								alignItems='center'
								justify='space-between'
							>
								<Box p={2}>
									<div className={classes.adexLogoTop}>
										<Logo className={classes.logo} />
									</div>
								</Box>
								<AuthSelect {...rest} />
								<Box p={2}>
									<small className={classes.adxVersion}>
										{`v.${packageJson.version}-beta`}
									</small>
								</Box>
							</Grid>
						</Grid>
					</Grid>
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
			actions: bindActionCreators(actions, dispatch),
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(withStyles(styles)(Connect)))
}
