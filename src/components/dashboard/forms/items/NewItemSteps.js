import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button } from 'react-toolbox/lib/button'
import MaterialStepper from './../stepper/MaterialStepper'
import NewItemForm from './NewItemForm'
import NewItemFormPreview from './NewItemFormPreview'
import NewItemHoc from './NewItemHocStep'
import ValidItemHoc from './../ValidItemHoc'

const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label='Save' primary onClick={props.save} />
    )
}

const SaveBtnWithItem = NewItemHoc(saveBtn)

class NewItemSteps extends Component {
    render() {

        let validateId =  'new-' + this.props.itemType + '-'
        let pages = [{
            title: 'Step 1',
            component: ValidItemHoc(NewItemForm),
            props: { ...this.props, validateId: validateId + 0 }
        }]

        this.props.itemPages.map((itemPage, index) => {
            pages.push({
                title: 'Step ' + (index + 2),
                component: ValidItemHoc(itemPage),
                props: { ...this.props, validateId: validateId + (index + 1) }
            })
        })

        pages.push(
            {
                title: 'Preview and save',
                completeBtn: () => <SaveBtnWithItem  {...this.props} itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />,
                component: NewItemFormPreview,
                props: { ...this.props }
            }
        )

        return (
            <div style={{ textAlign: 'center' }}>
                <MaterialStepper pages={pages} itemType={this.props.itemType} />
            </div>
        )
    }
}

NewItemSteps.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    addTo: PropTypes.object,
    itemPages: PropTypes.arrayOf(PropTypes.func)

}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account
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

