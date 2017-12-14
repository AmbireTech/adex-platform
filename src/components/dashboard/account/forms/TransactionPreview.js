import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from 'components/dashboard/forms/theme.css'
import Bid from 'models/Bid'
import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import numeral from 'numeral'

class TransactionPreview extends Component {
    render() {
        let bid = this.props.bid || {}
        let t = this.props.t

        return (
            <div>
                {/* TODO: Add translations and format the numbers */}
                <Grid fluid>
                    <Row>
                        {/* <Col xs={12} lg={4} className={theme.textRight}> {t('SPACES_COUNT')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{numeral(bid.requiredPoints).format('0,0')} </Col> */}
                    </Row>
                </Grid>
            </div>
        )
    }
}

TransactionPreview.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        transaction: memory.newTransactions[props.trId] || {},
        trId: props.trId
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let TransactionPreviewForm = NewTransactionHoc(TransactionPreview)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TransactionPreviewForm)
