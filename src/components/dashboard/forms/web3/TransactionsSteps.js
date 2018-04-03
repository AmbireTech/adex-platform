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

const saveBtn = ({ save, saveBtnLabel, saveBtnIcon, t, transaction, ...other }) => {
    return (
        <Button icon={saveBtnIcon || 'icon'} label={t(saveBtnLabel || 'DO_IT')} primary onClick={save} disabled={transaction.errors && transaction.errors.length} />
    )
}

const SaveBtnWithTransaction = TransactionHoc(saveBtn)

const cancelBtn = ({ cancel, cancelBtnLabel, t, ...other }) => {
    return (
        <Button label={t(cancelBtnLabel || 'CANCEL')} onClick={cancel} />
    )
}

const CancelBtnWithTransaction = TransactionHoc(cancelBtn)

class NewTransactionSteps extends Component {

    render() {
        let t = this.props.t
        let pages = []

        const cancelButton = () => <CancelBtnWithTransaction  {...this.props} onSave={this.props.onSave} t={t} />

        this.props.trPages.map((trPage, index) => {
            pages.push({
                title: t(trPage.title || 'Step ' + (index + 1)),
                cancelBtn: cancelButton,
                component: ValidItemHoc(trPage.page || trPage),
                props: { ...this.props, validateId: this.props.trId + '' + (index + 1) }
            })
        })

        pages.push({
            title: t('PREVIEW_AND_MAKE_TR'),
            completeBtn: () => <SaveBtnWithTransaction {...this.props} onSave={this.props.onSave} t={t} />,
            cancelBtn: cancelButton,
            component: ValidItemHoc(TransactionPreview),
            props: { ...this.props, validateId: this.props.trId }
        })

        return (
            <span style={{ textAlign: 'left' }}>
                <MaterialStepper pages={pages} />
            </span>
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