
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './theme.css'
import ImgForm from 'components/dashboard/forms/ImgForm'
import { items as ItemsConstants } from 'adex-constants'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

const { ItemTypesNames } = ItemsConstants

const AVATAR_MAX_WIDTH = 600
const AVATAR_MAX_HEIGHT = 400
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
            this.props.handleToggle()
        })

    }

    getActions = () => [
        { label: "Cancel", onClick: this.props.handleToggle, disabled: false },
        { label: "Ok", onClick: this.onOk, disabled: !!(this.props.invalidFields || {})['img'] }
    ]

    render() {
        let t = () => { }
        let validations = this.props.invalidFields || {}
        let errImg = validations['img']
        return (
            <span>
                <Dialog
                    theme={theme}
                    active={this.props.active}
                    onEscKeyDown={this.props.handleToggle}
                    onOverlayClick={this.props.handleToggle}
                    title={this.props.title}
                    type={this.props.type || 'normal'}
                    className={theme[ItemTypesNames[this.props.itemType]]}
                    actions={this.getActions()}
                >
                    <IconButton
                        icon='close'
                        onClick={this.props.handleToggle}
                        primary
                        style={{ position: 'absolute', top: 20, right: 20 }}
                    />

                    <Grid fluid className={theme.grid}>
                        <Row>
                            <Col sm={12}>
                                <ImgForm
                                    label={t(this.props.imgLabel)}
                                    imgSrc={this.props.imgSrc || ''}
                                    onChange={this.props.validateImg.bind(this,
                                        { propsName: 'img', widthTarget: this.props.width || AVATAR_MAX_WIDTH, heightTarget: this.props.height || AVATAR_MAX_HEIGHT, msg: this.props.errMsg, exact: this.props.exact, required: this.props.required, onChange: this.handleChange })}
                                    additionalInfo={t(this.props.additionalInfo)}
                                    errMsg={errImg ? errImg.errMsg : ''}
                                />
                            </Col>
                        </Row>
                    </Grid>



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
)(ValidItemHoc(ValidImageHoc(ImgDialog)))
