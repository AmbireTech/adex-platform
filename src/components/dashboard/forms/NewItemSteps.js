import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import { Button } from 'react-toolbox/lib/button'
// import ProgressBar from 'react-toolbox/lib/progress_bar'
// import theme from './theme.css'
import MaterialStepper from './stepper/MaterialStepper'
import NewItemForm from './NewItemForm'
import NewItemFormPreview from './NewItemFormPreview'
import NewItemHoc from './NewItemHocStep'

const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label='Save' primary onClick={props.save} />
    )
}

const SaveBtnWithItem = NewItemHoc(saveBtn)

class NewItemSteps extends Component {
    render() {
        return (
            <div style={{ textAlign: 'center' }}>

                <MaterialStepper pages={[
                    {
                        title: 'Step one',
                        component: () => <NewItemForm itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />
                    }, {
                        title: 'Step two',
                        component: () => <this.props.pageTwo itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />
                    }, {
                        title: 'Preview and save',
                        completeBtn: () => <SaveBtnWithItem itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />,
                        component: () => <NewItemFormPreview itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />
                    }
                ]} />
            </div>
        )
    }
}

NewItemSteps.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired,
    addTo: PropTypes.object,
    pageTwo: PropTypes.func
}

function mapStateToProps(state, props) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        // newItem: state.newItem[props.itemType],
        items: state.items[props.itemType]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewItemSteps)

