import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button } from 'react-toolbox/lib/button'
import MaterialStepper from 'components/dashboard/forms/stepper/MaterialStepper'
import AcceptBidForm from './AcceptBidForm'
import AcceptBidFormPreview from './AcceptBidFormPreview'
import AcceptBidHoc from './AcceptBidHoc'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'

const saveBtn = ({ ...props }) => {
    return (
        <Button icon='save' label='Accept the bid' primary onClick={props.save} />
    )
}

const SaveBtnWithItem = AcceptBidHoc(saveBtn)

class AcceptBidSteps extends Component {

    render() {
        let t = this.props.t
        let pages = [{
            title: t('STEP_N', { args: [1] }),
            component: ValidItemHoc(AcceptBidForm),
            props: { ...this.props, validateId: this.props.bidId }
        }, {
            title: t('PREVIEW_AND_BID'),
            completeBtn: () => <SaveBtnWithItem {...this.props} itemType={this.props.itemType} addTo={this.props.addTo} onSave={this.props.onSave} />,
            component: ValidItemHoc(AcceptBidFormPreview),
            props: { ...this.props, validateId: this.props.bidId }
        }]

        return (
            <div style={{ textAlign: 'left' }}>
                <MaterialStepper pages={pages} />
            </div>
        )
    }
}

AcceptBidSteps.propTypes = {
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
)(Translate(AcceptBidSteps))