
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import CancelIcon from '@material-ui/icons/Cancel'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import ImgForm from 'components/dashboard/forms/ImgForm'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import { AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT } from 'constants/misc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class ImgDialog extends Component {

	constructor(props) {
		super(props)
		this.state = {
			values: {}
		}
	}

	handleChange = (name, value) => {
		let newValues = { ...this.state.values }
		newValues[name] = value
		this.setState({ values: newValues })
	}

	onOk = () => {
		const vals = this.state.values
		Object.keys(vals).forEach((key) => {
			this.props.onChangeReady(key, vals[key])
		})
		this.props.handleToggle()

	}

	render() {
		let t = () => { }
		let validations = this.props.invalidFields || {}
		let errImg = validations[this.props.imgPropName]
		let width = this.props.width || AVATAR_MAX_WIDTH
		let height = this.props.height || AVATAR_MAX_HEIGHT
		return (
			<span>
				<Dialog
					open={this.props.active}
					// onEscKeyDown={this.props.handleToggle}
					// onOverlayClick={this.props.handleToggle}
					title={this.props.title}
					type={this.props.type || 'normal'}
				// className={theme[ItemTypesNames[this.props.itemType]]}
				>
					<DialogTitle>
						<IconButton
							onClick={this.props.handleToggle}
						>
							<CancelIcon />
						</IconButton>
						{this.props.t(this.props.title)}
					</DialogTitle>
					<DialogContent >
						<ImgForm
							label={t(this.props.imgLabel)}
							imgSrc={this.props.imgSrc || ''}
							onChange={this.props.validateMedia.bind(
								this,
								{
									propsName: this.props.imgPropName,
									widthTarget: width,
									heightTarget: height,
									msg: this.props.errMsg,
									exact: this.props.exact,
									required: this.props.required,
									onChange: this.handleChange
								})}
							additionalInfo={t(this.props.additionalInfo)}
							errMsg={errImg ? errImg.errMsg : ''}
							size={{ width: width, height: height }}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={this.props.handleToggle}
							color="primary"
						>
							{'Cancel'}
						</Button>
						<Button
							onClick={this.onOk}
							color="primary"
							autoFocus
							disabled={!!(this.props.invalidFields || {})[this.props.imgPropName]}
						>
							{'Ok'}
						</Button>
					</DialogActions>
				</Dialog>
			</span>
		)
	}
}

ImgDialog.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
	let persist = state.persist
	// let memory = state.memory
	return {
		account: persist.account
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ValidItemHoc(ValidImageHoc(withStyles(styles)(ImgDialog))))
