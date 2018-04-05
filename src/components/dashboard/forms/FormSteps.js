import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import MaterialStepper from 'components/dashboard/forms/stepper/MaterialStepper'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

class FormSteps extends Component {

    render() {
        let pages = []
        const { SaveBtn, CancelBtn, t, onSave, stepsId, stepsPages, stepsPreviewPage, ...rest } = this.props

        const cancelButton = () => <CancelBtn  {...rest} stepsId={stepsId} onSave={onSave} t={t} />

        stepsPages.map((page, index) => {
            pages.push({
                title: t(page.title || 'Step ' + (index + 1)),
                cancelBtn: cancelButton,
                component: ValidItemHoc(page.page || page),
                props: { ...this.props, validateId: stepsId + '-' + (index + 1) }
            })
        })

        pages.push({
            title: t(stepsPreviewPage.title || 'PREVIEW'),
            completeBtn: () => <SaveBtn {...rest} stepsId={stepsId} onSave={onSave} t={t} />,
            cancelBtn: cancelButton,
            component: ValidItemHoc(stepsPreviewPage.page || stepsPreviewPage),
            props: { ...this.props, validateId: stepsId + '-' + stepsPages.length }
        })

        return (
            <span style={{ textAlign: 'left' }}>
                <MaterialStepper pages={pages} />
            </span>
        )
    }
}

FormSteps.propTypes = {
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
)(Translate(FormSteps))