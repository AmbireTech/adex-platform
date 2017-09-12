

import React, { Component } from 'react'
import Chip from 'react-toolbox/lib/chip'
import { Button } from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
// import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'
import Dialog from 'react-toolbox/lib/dialog'
import Input from 'react-toolbox/lib/input'

const TooltipFontIcon = Tooltip(FontIcon)

export default function NewItemHoc(Decorated) {
    return class ItemForm extends Component {
        constructor(props) {
            super(props)

            this.save = this.save.bind(this);

            this.state = {
                active: false
            };
        }

        handleToggle = () => {
            this.setState({ active: !this.state.active });
        }

        handleChange = (name, value) => {
            this.props.actions.updateNewItem(this.props.newItem, { [name]: value })
        };

        save() {
            this.props.actions.addItem(Object.assign({}, this.props.newItem))
            this.props.actions.resetNewItem(this.props.newItem)
            this.handleToggle()
        }

        render() {

            let item = this.props.newItem

            return (
                <div>
                    <Button icon='add' label={this.props.btnLabel} onClick={this.handleToggle} primary={this.props.primary} raised={this.props.raised} accent={this.props.accent} flat={this.props.flat} />
                    <Dialog
                        active={this.state.active}
                        onEscKeyDown={this.handleToggle}
                        onOverlayClick={this.handleToggle}
                        title={this.props.title}
                    >
                        <section>
                            <Input type='text' label='Name' name='name' value={item._meta.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={128} />
                            <Input type='text' label='Image url' name='img' value={item._meta.img} onChange={this.handleChange.bind(this, 'img')} maxLength={1024} />
                            <Input type='text' multiline rows={5} label='Description' name='desctiption' value={item._meta.description} onChange={this.handleChange.bind(this, 'description')} maxLength={1024} />
                            <Decorated {...this.props} save={this.save}  handleChange={this.handleChange}/>
                            <br />
                            <Button icon='save' label='Save' raised primary onClick={this.save} />
                        </section>
                    </Dialog>
                </div>
            )
        }
    }
}
