
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Snackbar from 'react-toolbox/lib/snackbar'

export class Toast extends Component {
    constructor(props) {
        super(props)

        this.state = {
            active: false,
            toast: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        let toast = this.state.toast
        let nextToast = nextProps.toasts[0]

        let isNewToast = !!nextToast && (toast.id !== nextToast.id)

        if (isNewToast) {
            // this.setState({ active: true, toast: nextToast })
            this.setState({ active: false }, () => {
                setTimeout(() => {
                    this.setState({ active: true, toast: nextToast })
                    setTimeout(() => {
                        this.props.actions.removeToast(nextToast.id)
                    }, 800)
                }, 800)
            })
        }
    }

    close = (id) => {
        this.setState({ active: false })
        this.props.actions.removeToast(id)

    }

    render() {
        var toast = this.state.toast

        if (!toast) return null

        return (
            <Snackbar
                action={toast.action}
                active={this.state.active}
                label={toast.label}
                timeout={toast.timeout || 0}
                onClick={this.close.bind(this, toast.id)}
                onTimeout={this.close.bind(this, toast.id)}
                type={toast.type}
            />
        )
    }
}

Toast.propTypes = {
    actions: PropTypes.object.isRequired,
    toasts: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    state = state.storage
    return {
        toasts: state.toasts || []
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
)(Toast);
