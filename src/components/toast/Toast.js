
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Snackbar from 'react-toolbox/lib/snackbar'
import FontIcon from 'react-toolbox/lib/font_icon'
import theme from './theme.css'

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

    label = ({ type, label }) => {

        let icon = ''
        switch (type) {
            case 'accept':
                icon = 'check_circle'
                break
            case 'cancel':
                icon = 'error'
                break
            case 'warning':
                icon = 'warning'
                break
            default:
                break
        }

        return (
            <span><FontIcon value={icon} style={{ verticalAlign: 'bottom', marginRight: 10 }} /> <strong> {label} </strong> </span>
        )
    }

    render() {
        let toast = this.state.toast

        if (!toast) return null

        return (
            <Snackbar
                action={toast.action}
                active={this.state.active}
                label={<this.label type={toast.type} label={(toast.label || '').toString()} />}
                timeout={toast.timeout || 0}
                onClick={this.close.bind(this, toast.id)}
                onTimeout={this.close.bind(this, toast.id)}
                type={toast.type}
                theme={theme}
            />
        )
    }
}

Toast.propTypes = {
    actions: PropTypes.object.isRequired,
    toasts: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    // let persist = state.persist
    let memory = state.memory
    return {
        toasts: memory.toasts || []
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
