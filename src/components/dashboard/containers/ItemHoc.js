import React, { Component } from 'react'
import Chip from 'react-toolbox/lib/chip'
import { Button, IconButton } from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'
import Input from 'react-toolbox/lib/input'

const TooltipFontIcon = Tooltip(FontIcon)

export default function ItemHoc(Decorated) {
    return class Item extends Component {
        constructor(props) {
            super(props)
            this.save = this.save.bind(this)
            this.state = {
                activeFields: {}
            }
        }

        componentDidUpdate(prevProps, prevState) {
            let itemId = this.props.match.params.itemId
            let item = this.props.items[itemId]
            let prevItem = prevProps.items[itemId]

            if (item !== prevItem) {
                this.setCurrentItem()
                this.setState({ activeFields: {} })
            }
        }

        componentWillMount() {
            this.setCurrentItem()
        }

        componentWillUnmount() {
            this.setCurrentItem({})
        }

        handleChange = (name, value) => {
            this.props.actions.updateCurrentItem(this.props.item, { [name]: value })
        }

        setActiveFields(field, value) {
            let newActiveFields = { ...this.state.activeFields }
            newActiveFields[field] = value
            this.setState({ activeFields: newActiveFields })
        }

        setCurrentItem(nexItem) {
            let item = nexItem || this.props.items[this.props.match.params.itemId]
            this.props.actions.setCurrentItem(item)
            this.props.actions.updateSpinner(this.props.item.typeName, false)
        }

        //TODO: Do not save if not dirty!
        save() {
            this.props.actions.updateItem(this.props.item, this.props.item.meta)
            this.props.actions.updateSpinner(this.props.item.typeName, true)
        }

        isDirtyProp(prop) {
            return this.item.dirtyProps.indexOf(prop) > -1

        }

        render() {

            return (
                <div>
                    <div>
                        <div className={theme.top + ' ' + theme.left}>
                            {this.state.activeFields.fullName ?
                                <Input type='text' label='fullName' name='fullName' value={this.props.item.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={32} />
                                :
                                <h2>
                                    <span> {this.props.item.fullName} </span>
                                    <IconButton style={{ float: 'right' }} icon='edit' accent onClick={this.setActiveFields.bind(this, 'fullName', true)} />
                                </h2>
                            }

                            {this.state.activeFields.description ?
                                <Input multiline rows={3} type='text' label='description' name='description' value={this.props.item.description} onChange={this.handleChange.bind(this, 'description')} maxLength={32} />
                                :
                                <div>
                                    <p> {this.props.item.description} </p>
                                    <IconButton style={{ float: 'right' }} icon='edit' accent onClick={this.setActiveFields.bind(this, 'description', true)} />
                                </div>
                            }

                        </div>
                        <div className={theme.top + ' ' + theme.right}>

                            {!!this.props.spinner ?
                                <ProgressBar type="circular" mode="indeterminate" multicolor theme={theme} />
                                : (
                                    this.props.item.dirty ?
                                        (
                                            <div className={theme.itemStatus}>
                                                {this.props.item.dirtyProps.map((p) => {
                                                    return (<Chip key={p}>{p}</Chip>)
                                                })}
                                                <TooltipFontIcon value='info_outline' tooltip='Unsaved changes' />
                                            </div>
                                        ) : ''
                                )}
                            <Button icon='save' onClick={this.save} floating primary />
                        </div>

                    </div>



                    <div>
                        <Decorated {...this.props} save={this.save} />
                    </div>

                </div>
            )
        }
    }
}
