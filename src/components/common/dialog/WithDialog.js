import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, IconButton } from 'react-toolbox/lib/button'
import IconButtonMui from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog' // 'react-toolbox/lib/dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Fade from '@material-ui/core/Fade'
// import theme from './theme.css'
import classnames from 'classnames'
import RTButtonTheme from 'styles/RTButton.css'
import Translate from 'components/translate/Translate'
import Slide from '@material-ui/core/Slide'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './theme'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

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
                    raised: this.props.raised,
                    floating: this.props.floating,
                    flat: this.props.flat
                }
            }

            const { stiles, classes, ...other } = this.props


            return (
                <div >
                    <ButtonComponent
                        disabled={this.props.disabled}
                        icon={this.props.icon === undefined ? 'add' : this.props.icon}
                        label={this.props.floating ? '' : this.props.t(this.props.btnLabel, { args: this.props.btnLabelArgs || [''] })}
                        onClick={this.handleToggle}
                        primary={this.props.primary}
                        {...btnProps}
                        accent={this.props.accent}
                        theme={this.props.theme}
                        style={this.props.style}
                        className={classnames(
                            this.props.className,
                            { [classes.floating]: this.props.floating },
                            { [RTButtonTheme[this.props.color]]: !!this.props.color }
                        )}
                    />
                    <Dialog
                        // disableBackdropClick
                        // disableEscapeKeyDown
                        // maxWidth="xs"
                        // fullScreen
                        // theme={theme}
                        // className={classnames({ [theme.darkerBackground]: !!this.props.darkerBackground })}
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
                            <IconButtonMui
                                onClick={this.handleToggle}
                            >
                                <Icon>cancel</Icon>
                            </IconButtonMui>
                            {this.props.t(this.props.title)}
                        </DialogTitle>
                        {/* </Toolbar>
                        </AppBar> */}
                        <DialogContent
                            classes={{ root: classes.content }}
                        >
                            <Decorated {...this.props} onSave={this.onSave()} />
                        </DialogContent>
                    </Dialog>

                </div>
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

