import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import classnames from 'classnames'
import Translate from 'components/translate/Translate'
import Slide from '@material-ui/core/Slide'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import Icon from '@material-ui/core/Icon'
import CancelIcon from '@material-ui/icons/Cancel'
import DialogActions from '@material-ui/core/DialogActions'

const textBtn = ({ label, className, classes, style, onClick, ...rest }) => {
    return <span className={classnames(classes.textBtn, className)} style={style} onClick={onClick}> {label} </span>
}

const TextBtn = withStyles(styles)(textBtn)

const Transition = (props) => {
    return <Slide direction="up" {...props} />;
}

export default function ItemHoc(Decorated) {
    class WithDialog extends Component {
        constructor(props) {
            super(props)
            this.state = {
                active: false
            }
        }

        componentWillReceiveProps(nextPorps, nextState) {
            if (nextPorps.closeDialog && this.state.active) {
                this.handleToggle()
            }
        }

        handleToggle = () => {
            let active = this.state.active
            this.setState({ active: !active })
        }

        onSave = () => {
            let onSave = []

            onSave.push(this.handleToggle)

            if (typeof this.props.onSave === 'function') {
                onSave.push(this.props.onSave)
            }

            if (Array.isArray(this.props.onSave)) {
                for (var index = 0; index < this.props.onSave.length; index++) {
                    if (typeof this.props.onSave[index] === 'function') {
                        onSave.push(this.props.onSave[index])
                    }
                }
            }

            return onSave
        }

        render() {

            let ButtonComponent = Button
            // NOTE: to avoid some warnings
            let btnProps = {}

            if (this.props.iconButton) {
                ButtonComponent = IconButton
            } else if (this.props.textButton) {
                ButtonComponent = TextBtn
            } else {
                btnProps = {
                    variant: this.props.variant,
                    color: this.props.color,
                    size: this.props.size,
                    mini: !!this.props.mini
                }
            }

            const { classes } = this.props

            const btnLabel = this.props.t(this.props.btnLabel, { args: this.props.btnLabelArgs || [''] })
            // TODO: fix it for fab wit text
            const isIconBtn = (this.props.variant == 'fab') || this.props.iconButton

            return (
                <div >
                    <ButtonComponent
                        disabled={this.props.disabled}
                        aria-label={btnLabel}
                        label={btnLabel}
                        onClick={this.handleToggle}
                        {...btnProps}
                        // style={this.props.style}
                        className={classnames(
                            this.props.className,
                            { [classes.floating]: this.props.variant === 'fab' },
                            { [classes.first]: this.props.color === 'first' },
                            { [classes.second]: this.props.color === 'second' }
                        )}
                    >
                        {this.props.icon && <Icon className={classnames({ [classes.btnIconLeft]: !isIconBtn })} > {this.props.icon}</Icon>}
                        {!isIconBtn && btnLabel}
                    </ButtonComponent>
                    <Dialog
                        // disableBackdropClick
                        // disableEscapeKeyDown
                        // maxWidth="xs"
                        // fullScreen
                        open={this.state.active}
                        onClose={this.handleToggle}
                        TransitionComponent={Transition}
                        classes={{ paper: classes.dialog }}
                    // onEscKeyDown={this.handleToggle}
                    // onOverlayClick={this.handleToggle}
                    >
                        {/* <AppBar className={classes.appBar}>
                            <Toolbar> */}
                        <DialogTitle>
                            <IconButton
                                onClick={this.handleToggle}
                            >
                                <CancelIcon />
                            </IconButton>
                            {this.props.t(this.props.title)}
                        </DialogTitle>
                        {/* </Toolbar>
                        </AppBar> */}
                        <DialogContent
                            classes={{ root: classes.content }}
                        >
                            <Decorated {...this.props} onSave={this.onSave()} />
                        </DialogContent>
                        {this.props.dialogActions &&
                           <DialogActions>
                               {this.props.dialogActions}
                            </DialogActions>
                        }
                    </Dialog>

                </div >
            )
        }
    }

    WithDialog.propTypes = {
        btnLabel: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        floating: PropTypes.bool
    }

    return Translate(withStyles(styles)(WithDialog))
}

