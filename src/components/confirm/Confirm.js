
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Dialog from 'react-toolbox/lib/dialog'
import Translate from 'components/translate/Translate'

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
                    { label: this.props.cancelLabel || this.props.t('CANCEL'), onClick: this.cancel },
                    { label: this.props.confirmLabel || this.props.t('OK'), onClick: this.confirm }
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
    calledOn: PropTypes.number
};

function mapStateToProps(state) {
    state = state.storage
    return {
        cancelLabel: state.confirm.data.cancelLabel,
        confirmLabel: state.confirm.data.confirmLabel,
        title: state.confirm.data.title || '',
        text: state.confirm.data.text || '',
        confirm: state.confirm.onConfirm,
        cancel: state.confirm.onCancel,
        visible: state.confirm.active || false,
        calledOn: state.confirm.calledOn
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
)(Translate(Confirm))
