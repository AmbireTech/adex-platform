
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../actions/itemActions'
import Dialog from 'react-toolbox/lib/dialog'

export class Confirm extends Component {
    constructor(props) {
        super(props)

        this.cancel = this.cancel.bind(this)
        this.confirm = this.confirm.bind(this)
        this.state = {
            active: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ active: nextProps.visible })
    }

    confirm() {
        if (typeof this.props.confirm === 'function') {
            this.props.confirm()
        }
        this.setState({ active: false })
    }

    cancel() {
        if (typeof this.props.cancel === 'function') {
            this.props.cancel()
        }

        this.setState({ active: false })
    }

    render() {

        return (
            <Dialog
                actions={[
                    { label: this.props.cancelLabel, onClick: this.cancel },
                    { label: this.props.confirmLabel, onClick: this.confirm }
                ]}
                active={this.state.active}
                onEscKeyDown={this.cancel}
                onOverlayClick={() => { }}
                title={this.props.title}
            >
                <div>
                    {this.props.text}
                    {this.props.children}
                </div>

            </Dialog>
        )
    }
}

Confirm.propTypes = {
    actions: PropTypes.object.isRequired,
    cancelLabel: PropTypes.string,
    confirmLabel: PropTypes.string,
    title: PropTypes.string.isRequired,
    text: PropTypes.string,
    confirm: PropTypes.func,
    cancel: PropTypes.func,
    visible: PropTypes.bool,
};

function mapStateToProps(state) {
    return {
        cancelLabel: state.confirm.data.cancelLabel || 'Cancel',
        confirmLabel: state.confirm.data.confirmLabel || 'Ok',
        title: state.confirm.data.title || 'Title',
        text: state.confirm.data.text || 'Text',
        confirm: state.confirm.onConfirm,
        cancel: state.confirm.onCancel,
        visible: state.confirm.active || false,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Confirm);
