
import React, { Component } from 'react'
import Chip from 'react-toolbox/lib/chip'
import { Button } from 'react-toolbox/lib/button'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import FontIcon from 'react-toolbox/lib/font_icon'
import Tooltip from 'react-toolbox/lib/tooltip'

const TooltipFontIcon = Tooltip(FontIcon)

export default function ItemHoc(Decorated) {
    return class Item extends Component {
        constructor(props) {
            super(props)
            this.save = this.save.bind(this)
        }

        componentDidUpdate(prevProps, prevState) {
            let itemId = this.props.match.params.itemId
            let item = this.props.items[itemId]
            let prevItem = prevProps.items[itemId]

            if (item !== prevItem) {
                //TODO: Make notifications to trigger on store changed!
                this.props.actions.addToast({type: 'accept', action: 'Ok', label: item._name + ' has been updated!', timeout: 5000})
                this.setCurrentItem()
            }
        }

        componentWillMount() {
            this.setCurrentItem()
        }

        componentWillUnmount() {
            this.setCurrentItem({})
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
                    <Decorated {...this.props} save={this.save} />
                    <div>

                        <Button icon='bookmark' label='Save' onClick={this.save} raised primary />
                        {
                            !!this.props.spinner ?
                                <ProgressBar type="circular" mode="indeterminate" multicolor theme={theme} />
                                : (
                                    this.props.item.dirty ?
                                        (
                                            <div className={theme.itemStatus}>
                                                <TooltipFontIcon value='info_outline' tooltip='Unsaved changes' />
                                                {this.props.item.dirtyProps.map((p) => {
                                                    return (<Chip key={p}>{p}</Chip>)
                                                })}

                                            </div>
                                        ) : ''
                                )

                        }

                    </div>

                </div>
            )
        }
    }
}
