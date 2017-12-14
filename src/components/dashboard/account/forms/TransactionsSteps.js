import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button } from 'react-toolbox/lib/button'
import MaterialStepper from 'components/dashboard/forms/stepper/MaterialStepper'
import TransactionPreview from './TransactionPreview'
import TransactionHoc from './TransactionHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label='Place the bid' primary onClick={props.save} />
    )
}

const SaveBtnWithItem = TransactionHoc(saveBtn)

class NewTransactionSteps extends Component {

    render() {
        let t = this.props.t
        let pages = []

        this.props.trPages.map((trPage, index) => {
            pages.push({
                title: trPage.title || 'Step ' + (index + 2),
                component: ValidItemHoc(trPage.page || trPage),
                props: { ...this.props, validateId: this.props.itemType + '' + (index + 1) }
            })
        })


        pages.push({
            title: t('PREVIEW_AND_MAKE_TR'),
            completeBtn: () => <SaveBtnWithItem {...this.props} itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />,
            component: ValidItemHoc(TransactionPreview),
            props: { ...this.props, validateId: this.props.trId }
        })

        return (
            <div style={{ textAlign: 'left' }}>
                <MaterialStepper pages={pages} />
            </div>
        )
    }
}

NewTransactionSteps.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    itemPages: PropTypes.arrayOf(PropTypes.func)
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
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
)(Translate(NewTransactionSteps))