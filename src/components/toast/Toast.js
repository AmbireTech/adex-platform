
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Snackbar from '@material-ui/core/Snackbar'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const variantIcon = {
    accept: CheckCircleIcon,
    success: CheckCircleIcon,
    warning: WarningIcon,
    cancel: ErrorIcon,
    error: ErrorIcon,
    info: InfoIcon,
}

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
        const { toast } = this.state
        const { classes } = this.props
        const Icon = variantIcon[toast.type]

        if (!toast) return null

        return (
            <Snackbar
                open={this.state.active}
                autoHideDuration={toast.timeout || 0}
                onClose={() => this.close(toast.id)}
            >
                <SnackbarContent
                    aria-describedby="client-snackbar"
                    message={
                        <span id="client-snackbar" className={classes.message}>
                            <Icon className={classnames(classes.icon, classes.iconVariant)} />
                            {(toast.label || '').toString()}
                        </span>

                    }
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={() => this.close(toast.id)}
                        >
                            <CloseIcon className={classes.icon} />
                        </IconButton>,
                    ]}

                    className={classnames(
                        classes.snackbar,
                        {
                            [classes.accept]: toast.type === 'accept',
                            [classes.cancel]: toast.type === 'cancel',
                            [classes.warning]: toast.type === 'warning',
                        })}
                />
            </Snackbar>
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
)(withStyles(styles)(Toast))
