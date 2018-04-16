import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemHoc from './ItemHoc'
import { AdUnit } from 'adex-models'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import UnitTargets from './UnitTargets'
import Translate from 'components/translate/Translate'
import NewItemWithDialog from 'components/dashboard/forms/items/NewItemWithDialog'
import { NewBidSteps } from 'components/dashboard/forms/bids/bids'
import UnitBids from './UnitBids'
import { items as ItemsConstants } from 'adex-constants'
import { BasicProps } from './ItemCommon'
import { getUnitBids } from 'services/adex-node/actions'
import BidIcon from 'components/common/icons/BidIcon'

const { ItemsTypes } = ItemsConstants
const BidFormWithDialog = NewItemWithDialog(NewBidSteps)

export class Unit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            closeDialog: false,
            bids: []
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    getUnitBids = () => {
        getUnitBids({ authSig: this.props.account._authSig, adUnit: this.props.item._id })
            .then((bids) => {
                // console.log('unit bids', bids)
                // TODO: Maybe map to Bid instances?
                this.setState({ bids: bids })
            })
    }

    componentWillMount() {
        this.getUnitBids()
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     let diffProps = JSON.stringify(this.props) !== JSON.stringify(nextProps)
    //     let diffState = JSON.stringify(this.state) !== JSON.stringify(nextState)
    //     return diffProps || diffState
    // }

    onBidPlaced = () => {
        this.setState({ closeDialog: true })
        this.getUnitBids()
    }

    render() {

        let item = this.props.item
        let t = this.props.t

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                {!this.props.inEdit ?
                    <BidFormWithDialog
                        btnLabel='PLACE_BID'
                        title={this.props.t('PLACE_BID_FOR', { args: [item.fullName] })}
                        floating
                        primary
                        bidId={item._id}
                        stepsId={'new-bid-' + item._id}
                        // TODO: fix icon v align
                        icon={<BidIcon style={{ marginTop: 10 }} />}
                        adUnit={item}
                        closeDialog={!!this.state.closeDialog}
                        onSave={this.onBidPlaced}
                    /> : null}
                <BasicProps
                    item={item}
                    t={t}
                    url={item.adUrl}
                    rightComponent={<UnitTargets {...this.props} targets={item.meta.targets} t={t} subHeader={true} />}
                />
                <div>
                    <UnitBids item={item} bids={this.state.bids} getUnitBids={this.getUnitBids} />
                </div>
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
};

function mapStateToProps(state, props) {
    // let persist = state.persist
    // let memory = state.memory
    return {
        objModel: AdUnit,
        itemType: ItemsTypes.AdUnit.id
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const UnitItem = ItemHoc(Unit)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(UnitItem))
