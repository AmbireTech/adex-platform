import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import ImgForm from 'components/dashboard/forms/ImgForm'
import { items as ItemsConstants } from 'adex-constants'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import { AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT } from 'constants/misc'
import { validName } from 'helpers/validators'

const { ItemTypesNames } = ItemsConstants

class NewItemForm extends Component {

	componentDidMount() {
		/* TODO: make it understandable
        * Now it forces to add invalid property for the required filed to prevent to go to the next step
        */
		if (!this.props.item.fullName) {
			this.props.validate('fullName', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}
	}

	validateName(name, dirty) {
		const { msg, errMsgArgs } = validName(name)

		this.props.validate('fullName', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
	}

	render() {
		const { t, item } = this.props
		const errFullName = this.props.invalidFields['fullName']
		const errImg = this.props.invalidFields['img']

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={ItemTypesNames[item._type] + ' ' + this.props.t('name', { isProp: true })}
							name='name'
							value={item.fullName}
							onChange={(ev) => this.props.handleChange('fullName', ev.target.value)}
							onBlur={() => this.validateName(item.fullName, true)}
							onFocus={() => this.validateName(item.fullName, false)}
							error={errFullName && !!errFullName.dirty}
							maxLength={128}
							helperText={
								errFullName && !!errFullName.dirty ?
									errFullName.errMsg :
									(this.props.nameHelperTxt ? this.props.nameHelperTxt : '')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							multiline
							rows={3}
							label={t('description', { isProp: true })}
							value={item._description}
							onChange={(ev) => this.props.handleChange('description', ev.target.value)}
							maxLength={1024}
							helperText={this.props.descriptionHelperTxt || ''}
						/>
					</Grid>
					{!this.props.noDefaultImg &&
                        <Grid item sm={12}>
                        	<ImgForm
                        		label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}
                        		imgSrc={item.img.tempUrl || ''}
                        		onChange={this.props.validateImg.bind(this,
                        			{ propsName: 'img', widthTarget: AVATAR_MAX_WIDTH, heightTarget: AVATAR_MAX_HEIGHT, msg: 'ERR_IMG_SIZE_MAX', exact: false, required: false })}
                        		additionalInfo={t(this.props.imgAdditionalInfo)}
                        		errMsg={errImg ? errImg.errMsg : ''}
                        		size={{ width: AVATAR_MAX_WIDTH, height: AVATAR_MAX_HEIGHT }}
                        	/>
                        </Grid>
					}
				</Grid>
			</div>
		)
	}
}

NewItemForm.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	itemType: PropTypes.number.isRequired,
	imgLabel: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	return {
		account: persist.account,
		newItem: memory.newItem[props.itemType]
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const ItemNewItemForm = NewItemHoc(ValidImageHoc(NewItemForm))
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(ItemNewItemForm))
