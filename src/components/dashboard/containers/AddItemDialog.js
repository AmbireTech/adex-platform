import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, IconButton } from 'react-toolbox/lib/button'
// import theme from './theme.css'
import Dialog from 'react-toolbox/lib/dialog'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import ItemsList from './ItemsList'

export class AddItemDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false,
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    handleToggle = () => {
        let active = this.state.active
        this.setState({ active: !active })
    }

    render() {
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
                    type={this.props.type || 'fullscreen'}
                    theme={theme}
                >
                    <IconButton
                        icon='close'
                        onClick={this.handleToggle}
                        primary
                        style={{ position: 'absolute', top: 2, right: 2 }}
                    />

                    <Tabs theme={theme} className={theme.dialogTabs} index={this.state.tabIndex} onChange={this.handleTabChange.bind(this)}>
                        <Tab label='New Ad Unit'>
                            {this.props.newForm({ onSave: this.handleToggle.bind(this) })}
                        </Tab>
                        <Tab theme={theme} label='Add existing Ad Unit'>
                            <div className={theme.dialogItemsListContainer}>
                                <section className={theme.scrollable}>
                                    <ItemsList parentItem={this.props.addTo} addToItem items={this.props.items} viewModeId={this.props.viewMode} listMode={this.props.listMode} />
                                </section>
                            </div>
                        </Tab>
                    </Tabs>
                    {/* </div> */}
                </Dialog>

            </div >
        )
    }
}

AddItemDialog.propTypes = {
    btnLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    floating: PropTypes.bool,
    listMode: PropTypes.string
}

export default AddItemDialog

