import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import { Button } from 'react-toolbox/lib/button'
// import ProgressBar from 'react-toolbox/lib/progress_bar'
// import theme from './theme.css'
import Input from 'react-toolbox/lib/input'
import Base from './../../../models/Base'
import MaterialStepper from './../../stepper/MaterialStepper'
import NewItemFormS from './NewItemFormS'
import NewUnitFormS from './NewUnitFormS'

class NewItemSteps extends Component {

    render() {
        return (
            <div style={{ textAlign: 'center' }}>

                <MaterialStepper pages={[
                    {
                        title: 'Basic info',
                        component: () => <NewItemFormS itemType={this.props.itemType} onSave={this.props.onSave} />
                    }, {
                        title: 'Additional info',
                        component: () => <this.props.pageTwo itemType={this.props.itemType} onSave={this.props.onSave} />
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

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        // newItem: state.newItem[ItemsTypes.AdUnit.id],
        items: state.items[ItemsTypes.AdUnit.id]
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

