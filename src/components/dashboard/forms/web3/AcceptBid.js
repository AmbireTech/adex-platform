import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid, Row, Col } from 'react-flexbox-grid'
// import theme from 'components/dashboard/forms/theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
// import { Grid, Row, Col } from 'react-flexbox-grid'
// import numeral from 'numeral'
import Input from 'react-toolbox/lib/input'
// import { Button, IconButton } from 'react-toolbox/lib/button'
import { getItem } from 'services/adex-node/actions'

class AcceptBid extends Component {
    componentWillMount() {
        getItem({ id: this.props.adUnitId, authSig: this.props.account._authSig })
            .then((unit) => {
                this.props.handleChange('unit', unit)
                this.props.handleChange('placedBid', this.props.placedBid)
                this.props.handleChange('slot', this.props.slot)
                this.props.handleChange('account', this.props.acc)
            })
    }

    row = ({ left, right }) =>
        <Row >
            <Col xs={12} lg={4} className={'theme.textRight'}>{left}:</Col>
            <Col xs={12} lg={8} className={'theme.textLeft'}>{right}</Col>
        </Row>


    render() {
        let tr = this.props.transaction
        let t = this.props.t
        let unit = tr.unit || {}
        let unitMeta = unit._meta || {}
        let bid = this.props.placedBid || {}

        console.log('unitMeta', unitMeta)

        return (
            <div>
                <Grid fluid>
                    <this.row left={this.props.t('BID_CLICKS')} right={bid._target} />
                    <this.row left={this.props.t('BID_AMOUNT')} right={bid._amount} />
                    <this.row left={this.props.t('UNIT_TIMEOUT')} right={bid._timeout} />
                    <this.row left={this.props.t('UNIT_NAME')} right={unitMeta.fullName} />
                    <this.row left={this.props.t('UNIT_URL')} right={unitMeta.ad_url} />

                </Grid>
            </div>
        )
    }
}

AcceptBid.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    placedBid: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        // trId: 'approve'
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let AcceptBidForm = NewTransactionHoc(AcceptBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AcceptBidForm)
