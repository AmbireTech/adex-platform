
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes, ItemTypesNames } from 'constants/itemsTypes'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'
import theme from './theme.css'
import ImgForm from 'components/dashboard/forms/ImgForm'

export class ImgDialog extends Component {

    render() {

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
                >
                    <IconButton
                        icon='close'
                        onClick={this.handleToggle}
                        primary
                        style={{ position: 'absolute', top: 20, right: 20 }}
                    />

                    <ImgForm imgSrc={this.props.imgSrc} onChange={this.props.onChange} />

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
    return {
        account: state.account
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

// const UnitItem = ItemHoc(ImgDialog)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImgDialog);
