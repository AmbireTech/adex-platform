import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, IconButton } from 'react-toolbox/lib/button'
import { ItemTypesNames } from 'constants/itemsTypes'
import Dialog from 'react-toolbox/lib/dialog'
import theme from './../theme.css'
import classnames from 'classnames'
import RTButtonTheme from 'styles/RTButton.css'
import Translate from 'components/translate/Translate'

export default function ItemHoc(Decorated) {
    class NewItemWithDialog extends Component {
        constructor(props) {
            super(props)
            this.state = {
                active: false
            }
        }

        handleToggle = () => {
            let active = this.state.active
            this.setState({ active: !active })
        }

        onSave = () => {
            let onSave = []

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

            onSave.push(this.handleToggle)

            return onSave
        }

        render() {

            // console.log('theme', this.props.theme)
            return (
                <div>
                    <Button
                        disabled={this.props.disabled}
                        floating={this.props.floating}
                        icon={this.props.icon || 'add'}
                        label={this.props.floating ? '' : this.props.t(this.props.btnLabel)}
                        onClick={this.handleToggle}
                        primary={this.props.primary}
                        raised={this.props.raised}
                        accent={this.props.accent}
                        flat={this.props.flat}
                        theme={this.props.theme}
                        className={classnames(
                            { [theme.floating]: this.props.floating },
                            { [RTButtonTheme[this.props.color]]: !!this.props.color }
                        )}
                    />
                    <Dialog
                        theme={theme}
                        active={this.state.active}
                        onEscKeyDown={this.handleToggle}
                        onOverlayClick={this.handleToggle}
                        title={this.props.t(this.props.title)}
                        type={this.props.type || 'normal'}
                        className={theme[ItemTypesNames[this.props.itemType]]}
                    >
                        <IconButton
                            icon='close'
                            onClick={this.handleToggle}
                        />
                        <Decorated {...this.props} onSave={this.onSave()} />
                    </Dialog>

                </div>
            )
        }
    }

    NewItemWithDialog.propTypes = {
        btnLabel: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        floating: PropTypes.bool
    }

    return Translate(NewItemWithDialog)
}

