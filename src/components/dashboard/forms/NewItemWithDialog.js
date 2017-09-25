import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-toolbox/lib/button'
// import ProgressBar from 'react-toolbox/lib/progress_bar'
// import theme from './theme.css'
import Dialog from 'react-toolbox/lib/dialog'
import Input from 'react-toolbox/lib/input'
import Base from './../../../models/Base'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'



export class NewItemWithDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }


    handleToggle = () => {
        let active = this.state.active
        this.setState({ active: !active })

        if (active && typeof this.props.onToggleClose === 'function') {
            this.props.onToggleClose()
            // this.props.actions.updateNewItem(this.state.item, this.state.item._meta)
        }
    }

    render() {

        let item = this.state.item || {}
        item._meta = item._meta || {}

        // console.log('this.props.newForm', this.props.newForm)

        return (
            <div>

                <Button
                    floating={this.props.floating}
                    icon='add'
                    label={this.props.floating ? '' : this.props.btnLabel}
                    onClick={this.handleToggle}
                    primary={this.props.primary}
                    raised={this.props.raised}
                    accent={this.props.accent}
                    flat={this.props.flat}
                    className={this.props.floating ? theme.floating : ''}
                />
                <Dialog
                    active={this.state.active}
                    onEscKeyDown={this.handleToggle}
                    onOverlayClick={this.handleToggle}
                    title={this.props.title}
                >
                    {this.props.newForm({ onSave: this.handleToggle.bind(this) })}
                </Dialog>

            </div>
        )
    }
}

NewItemWithDialog.propTypes = {
    // actions: PropTypes.object.isRequired,
    // account: PropTypes.object.isRequired,
    // newItem: PropTypes.object.isRequired,
    btnLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    floating: PropTypes.bool
}

export default NewItemWithDialog

