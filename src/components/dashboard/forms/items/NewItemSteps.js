import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button } from 'react-toolbox/lib/button'
import MaterialStepper from './../stepper/MaterialStepper'
import NewItemFormPreview from './NewItemFormPreview'
import NewItemHoc from './NewItemHocStep'
import ValidItemHoc from './../ValidItemHoc'
import Translate from 'components/translate/Translate'

const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label='Save' primary onClick={props.save} />
    )
}

const SaveBtnWithItem = NewItemHoc(saveBtn)

const cancelBtn = ({ ...props }) => {
    return (
        <Button label='Cancel' onClick={props.cancel} />
    )
}

const CancelBtnWithItem = NewItemHoc(cancelBtn)

class NewItemSteps extends Component {
    render() {
        let t = this.props.t
        let validateId =  'new-' + this.props.itemType + '-'
        let pages = []

        const cancelButton = () => <CancelBtnWithItem  {...this.props} itemType={this.props.itemType} onSave={this.props.onSave} />

        this.props.itemPages.map((itemPage, index) => {
            pages.push({
                title: t(itemPage.title || 'Step ' + (index + 1)),
                cancelBtn: cancelButton,
                component: ValidItemHoc(itemPage.page || itemPage),
                props: { ...this.props, validateId: validateId + (index + 1) }
            })
        })

        pages.push(
            {
                title: t('PREVIEW_AND_SAVE_ITEM'),
                completeBtn: () => <SaveBtnWithItem  {...this.props} itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />,
                cancelBtn: () => cancelButton,
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
    itemPages: PropTypes.arrayOf(PropTypes.object)

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
)(Translate(NewItemSteps))

