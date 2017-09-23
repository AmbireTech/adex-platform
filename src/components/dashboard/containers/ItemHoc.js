import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Chip from 'react-toolbox/lib/chip'
import { Button, IconButton } from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'
import Input from 'react-toolbox/lib/input'
import { ItemTypesNames } from './../../../constants/itemsTypes'
import Base from './../../../models/Base'

const TooltipFontIcon = Tooltip(FontIcon)

export default function ItemHoc(Decorated) {
    class Item extends Component {
        constructor(props) {
            super(props)
            this.save = this.save.bind(this)
            this.state = {
                activeFields: {},
                item: {},
                dirtyProps: []
            }
        }

        componentDidUpdate(prevProps, prevState) {
            let itemId = this.props.match.params.itemId
            let item = this.props.items[itemId]
            let prevItem = prevProps.items[itemId]

            if (item._meta.modifiedOn !== prevItem._meta.modifiedOn) {
                this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], false)
                this.setState({ activeFields: {}, dirtyProps: [] })
            }
        }

        componentWillMount() {
            this.setState({ item: this.props.items[this.props.match.params.itemId] })
        }

        componentWillReceiveProps(nextProps) {
            // TODO: check if really need it
            // this.setState({ item: nextProps.items[nextProps.match.params.itemId] })
        }

        componentWillUnmount() {
            this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], false)
        }

        handleChange = (name, value) => {
            let newItem = Base.updateMeta(this.state.item, { [name]: value }, this.state.dirtyProps || [])
            this.setState({ item: newItem, dirtyProps: newItem.dirtyProps })
        }

        setActiveFields(field, value) {
            let newActiveFields = { ...this.state.activeFields }
            newActiveFields[field] = value
            this.setState({ activeFields: newActiveFields })
        }

        //TODO: Do not save if not dirty!
        save() {
            if (this.state.dirtyProps.length) {
                this.props.actions.updateItem(this.state.item, this.state.item._meta)
                this.props.actions.updateSpinner(ItemTypesNames[this.state.item._type], true)
            }
        }

        isDirtyProp(prop) {
            return this.state.item.dirtyProps.indexOf(prop) > -1

        }

        render() {

            let meta = this.state.item._meta || {}

            return (
                <div>
                    <div>
                        <div className={theme.top + ' ' + theme.left}>
                            {this.state.activeFields.fullName ?
                                <Input type='text' label='fullName' name='fullName' value={meta.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={32} />
                                :
                                <h2>
                                    <span> {meta.fullName} </span>
                                    <IconButton style={{ float: 'right' }} icon='edit' accent onClick={this.setActiveFields.bind(this, 'fullName', true)} />
                                </h2>
                            }

                            {this.state.activeFields.description ?
                                <Input multiline rows={3} type='text' label='description' name='description' value={meta.description} onChange={this.handleChange.bind(this, 'description')} maxLength={32} />
                                :
                                <div>
                                    <p> {meta.description} </p>
                                    <IconButton style={{ float: 'right' }} icon='edit' accent onClick={this.setActiveFields.bind(this, 'description', true)} />
                                </div>
                            }

                        </div>
                        <div className={theme.top + ' ' + theme.right}>

                            {!!this.props.spinner ?
                                <ProgressBar type="circular" mode="indeterminate" multicolor theme={theme} />
                                : (
                                    this.state.dirtyProps.length ?
                                        (
                                            <div className={theme.itemStatus}>
                                                {this.state.dirtyProps.map((p) => {
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
                        <Decorated {...this.props} item={this.state.item} save={this.save} handleChange={this.handleChange} />
                    </div>

                </div>
            )
        }
    }

    Item.propTypes = {
        actions: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        items: PropTypes.array.isRequired,
        spinner: PropTypes.bool
    }

    return Item
}
