import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button } from 'react-toolbox/lib/button'
import MaterialStepper from 'components/dashboard/forms/stepper/MaterialStepper'
import BidForm from './BidForm'
import BidFormPreview from './BidFormPreview'
import NewBidHoc from './NewBidHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

// TODO: Make common steps component for Bid, transactions and items
const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label={props.t('PLACE_BID_SAVE_BTN')} primary onClick={props.save} />
    )
}

const SaveBtnWithBid = NewBidHoc(saveBtn)

const cancelBtn = ({ ...props }) => {
    return (
        <Button label={props.t('CANCEL')} onClick={props.cancel} />
    )
}

const CancelBtnWithBid = NewBidHoc(cancelBtn)

class NewBidSteps extends Component {

    render() {
        let validateId = 'bid-' + this.props.bidId
        let t = this.props.t

        const cancelButton = () => <CancelBtnWithBid  {...this.props} onSave={this.props.onSave} />

        let pages = [{
            title: t('BID_DATA_STEP'),
            cancelBtn: cancelButton,
            component: ValidItemHoc(BidForm),
            props: { ...this.props, validateId: validateId }
        }, {
            title: t('PREVIEW_AND_BID'),
            completeBtn: () => <SaveBtnWithBid {...this.props} onSave={this.props.onSave} />,
            cancelBtn: cancelButton,
            component: ValidItemHoc(BidFormPreview),
            props: { ...this.props, validateId: validateId }
        }]

        return (
            <div style={{ textAlign: 'left' }}>
                <MaterialStepper pages={pages} />
            </div>
        )
    }
}

NewBidSteps.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    itemPages: PropTypes.arrayOf(PropTypes.func),
    adUnit: PropTypes.object.isRequired
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
)(Translate(NewBidSteps))