import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'
import theme from './theme.css'
import classnames from 'classnames'
import RTButtonTheme from 'styles/RTButton.css'
import Translate from 'components/translate/Translate'

const TextBtn = ({ label, className, style, onClick, ...rest }) => {
    return <span className={classnames(theme.textBtn, className)} style={style} onClick={onClick}> {label} </span>
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

            return (
                <div>
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
                            { [theme.floating]: this.props.floating },
                            { [RTButtonTheme[this.props.color]]: !!this.props.color }
                        )}
                    />
                    <Dialog
                        theme={theme}
                        className={classnames({ [theme.darkerBackground]: !!this.props.darkerBackground })}
                        active={this.state.active}
                        onEscKeyDown={this.handleToggle}
                        onOverlayClick={this.handleToggle}
                        title={this.props.t(this.props.title)}
                        type={this.props.type || 'large'}
                    >
                        <IconButton
                            icon='close'
                            onClick={this.handleToggle}
                        />
                        <div className={theme.dialogBody}>
                            <Decorated {...this.props} onSave={this.onSave()} />
                        </div>
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

    return Translate(WithDialog)
}

