import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from 'components/dashboard/containers/ItemsList'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Rows from 'components/dashboard/collection/Rows'
import theme from './theme.css'
import containerTheme from 'components/dashboard/containers/theme.css'
import Translate from 'components/translate/Translate'
import { IconButton, Button } from 'react-toolbox/lib/button'
import classnames from 'classnames'
import BidsGenerator from 'helpers/dev/auctionBidsStatsGenerator'
import { BidsStatisticsChart } from './bidsStatistics'
import NewBidSteps from './NewBidSteps'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import * as sc from 'services/smart-contracts/ADX'
import numeral from 'numeral'
import { decrypt } from 'services/crypto/crypto'
import ProgressBar from 'react-toolbox/lib/progress_bar'

import { registerAccount } from 'services/smart-contracts/actions/registry'

const BidFormWithDialog = NewItemWithDialog(NewBidSteps)

const VIEW_MODE = 'auctionRowsView'
const AVAILABLE_SLOTS = 2000000
const AUCTION_SLOT_ID = 1

// Can be changed. The ad unit representing the eJ advertising space
const MAGIC_ADUNIT = 2

const SORT_PROPERTIES = [
    // { value: 'price', label: 'Price' },
    // { value: 'count', label: 'Count' },
    // { value: 'wonNumber', label: 'Won number' },
    // { value: 'wonPriceTotal', label: 'Won Price Total' }
]

const searchMatch = (bid) => {
    return ((bid.id + '') || '') +
        ((bid.name + '') || '') +
        ((bid.price + '') || '') +
        ((bid.count + '') || '') +
        ((bid.wonNumber + '') || '')
}

const getEnctiptedPrice = (enc) => {
    let nolatz = enc.replace(/^0x0*|0+$/g, '')
    return nolatz
}

let BID_MODEL = {
    id: 0,
    name: 'Advertiser name',
    count: 100, // Slots(boarding passes)
    price: 5, // in USD cents
    total: 500, // in USD cents - for sorting purpose 
    wonNumber: 500,
    wonPriceTotal: 500, // in USD cents - for sorting purpose 
    execution: ''
}

export class Auction extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            bidding: false,
            bid: {},
            bids: [], //this.mapBids(BidsGenerator.getSomeRandomBids())
            bidsWeb3: []
        }
    }

    getAuctionBids(allBids, auctionBidsIds) {
        let bids = []

        for (let i = 0; i < auctionBidsIds.length; i++) {
            let bid = allBids[auctionBidsIds[i]]
            if (bid) {
                bids.push(bid)
            }
        }

        return this.mapBids(bids)
    }

    componentWillMount() {
        // TODO: add persisted account to web3.eth.accounts
        // console.log(sc.web3.eth.accounts.wallet)

        // registerAccount({ ...this.props.account, prKey: this.props.account._temp.privateKey })
        //     .then((result) => {
        //         console.log('registerAccount result in auction', result)
        //     })

        let that = this


        // TODO: make service
        sc.exchange.methods.bidsCount()
            .call()
            .then((count) => {
                console.log('count', count)
                let bidsIds = []
                for (let i = 1; i <= count; i++) {
                    bidsIds.push(sc.exchange.methods.getBid(i).call())
                }

                // return sc.exchange.methods.getBid(1).call()

                return Promise.all(bidsIds)
            })
            .then((allbids) => {
                // console.log('allbids', allbids)

                let mappedFromWeb3 = that.mapWeb3Bids(allbids)
                let bids = that.mapBids(mappedFromWeb3)

                // console.log('bids', bids)

                this.setState({ bids: bids })
            })


        let bids = this.getAuctionBids(this.props.bidsById, this.props.auctionBidsIds)

        this.setState({ bids: bids })
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.auctionBidsIds.length !== this.props.auctionBidsIds.leng) {
    //         let bids = this.getAuctionBids(nextProps.bidsById, nextProps.auctionBidsIds)
    //         this.setState({ bids: this.getAuctionBids(nextProps.bidsById, nextProps.auctionBidsIds) })
    //     }
    // }

    mapWeb3Bids(bids) {
        let mapped = bids.map((bid, index) => {
            return {
                id: index + 1,
                advertiserPeer: parseFloat(decrypt(getEnctiptedPrice(bid[7])), 10),
                requiredPoints: parseInt(bid[1], 10),
                adUnit: bid[5]

            }
        })

        return mapped
    }

    mapBids(bids) {
        return bids
            .sort((a, b) => {
                let aPrice = a.advertiserPeer
                let bPrice = b.advertiserPeer

                if (aPrice < bPrice) {
                    return 1
                } else if (aPrice > bPrice) {
                    return -1
                } else {
                    if (a.requiredPoints < b.requiredPoints) {
                        return 1
                    } else if (a.requiredPoints > b.requiredPoints) {
                        return -1
                    } else {
                        if (a.id < b.id) {
                            return -1
                        } else if (a.id > b.id) {
                            return 1
                        } else {
                            return 0
                        }
                    }
                }
            })
            .reduce((memo, bid, index) => {
                let usedSlots = memo.usedSlots
                let leftSlots = AVAILABLE_SLOTS - usedSlots
                let wonNumber = bid.requiredPoints
                let execution = 'full'
                let bids = memo.bids

                if (leftSlots <= 0) {
                    execution = 'none'
                } else if ((leftSlots - wonNumber) < 0) {
                    wonNumber = leftSlots
                    execution = 'partial'
                }

                let price = bid.advertiserPeer
                let name = bid.id
                switch (bid.adUnit) {
                    case '1': name = 'Stremio'
                        break
                    case '2': name = 'propy'
                        break
                    case '3': name = 'eToro'
                        break
                    case '4': name = 'Orion'
                        break
                    default:
                        break
                }
                let mappedBid = {
                    id: bid.id,
                    name: name,
                    price: price,
                    count: bid.requiredPoints,
                    total: price * bid.requiredPoints,
                    wonNumber: wonNumber,
                    wonPriceTotal: wonNumber * price,
                    execution: execution
                }

                if (!isNaN(price)) {
                    bids.push(mappedBid)
                    usedSlots = usedSlots + wonNumber
                }

                return {
                    bids: bids,
                    usedSlots: usedSlots
                }

            }, { bids: [], usedSlots: 0 })
            .bids
    }

    renderTableHead() {
        return (
            <TableHead>
                <TableCell> {this.props.t('NAME')} </TableCell>
                <TableCell> {this.props.t('PRICE')} </TableCell>
                <TableCell> {this.props.t('COUNT')} </TableCell>
                <TableCell> {this.props.t('TOTAL')} </TableCell>
                <TableCell> {this.props.t('WON_NUMBER')} </TableCell>
                <TableCell> {this.props.t('WON_TOTAL_PRICE')} </TableCell>
                <TableCell> {this.props.t('EXECUTION')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(item, index, { to, selected }) {
        let bgcolor = ''
        if (item.execution === 'full') {
            bgcolor = '#00E676'
        } else if (item.execution === 'partial') {
            bgcolor = '#FFAB00'
        }


        return (
            <TableRow key={item.id} style={{ backgroundColor: bgcolor }}>
                <TableCell> {item.name} </TableCell>
                <TableCell> {numeral(item.price).format('$ 0,0.00')} </TableCell>
                <TableCell> {numeral(item.count).format('0,0')} </TableCell>
                <TableCell> {numeral((item.price * item.count)).format('$ 0,0.00')} </TableCell>
                <TableCell> {numeral(item.wonNumber).format('0,0')} </TableCell>
                <TableCell> {numeral(item.wonPriceTotal).format('$ 0,0.00')} </TableCell>
                <TableCell> {item.execution} </TableCell>
            </TableRow >
        )
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={this.renderTableHead.bind(this)}
        />

    bid = (slot, active) => {
        this.setState({ bid: slot, bidding: active })
    }

    render() {
        let t = this.props.t
        return (
            <div>
                <div className={containerTheme.heading}>
                    <h1 className={containerTheme.itemName}>
                        {t('INK_AUCTION')}
                    </h1>
                </div>
                <div className={classnames(containerTheme.top)}>
                    <p>
                        {t('INK_AUCTION_DESCRIPTION')}
                    </p>
                </div>
                {(this.state.bids.length > 0) || true ?
                    <div>
                        <div>
                            <BidFormWithDialog
                                btnLabel='PLACE_BID'
                                title={this.props.t('PLACE_BID_FOR', { args: ['Ink'] })}
                                accent
                                // disabled
                                floating
                                bidId='INKBID'
                            />
                        </div>
                        <div>
                            <BidsStatisticsChart data={this.state.bids} t={this.props.t} />
                        </div>
                        <ItemsList
                            items={this.state.bids}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES}
                            searchMatch={searchMatch}
                            rowsView={VIEW_MODE}
                        />
                    </div>
                    :
                    <div style={{ textAlign: 'center' }}>
                        <ProgressBar type='circular' mode='indeterminate' multicolor />
                    </div>
                }
            </div>
        )
    }
}

Auction.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    rowsView: PropTypes.bool.isRequired,
    bidsById: PropTypes.object.isRequired,
    auctionBidsIds: PropTypes.array.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        rowsView: !!persist.ui[VIEW_MODE],
        bidsById: persist.bids.bidsById || {},
        auctionBidsIds: persist.bids.bidsByAdslot[AUCTION_SLOT_ID] || []
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
)(Translate(Auction))
