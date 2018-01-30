
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes, AdTypes, Sizes } from 'constants/itemsTypes'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'
// import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import { Item, AdUnit } from 'adex-models'
import theme from './theme.css'
import { IconButton, Button } from 'react-toolbox/lib/button'
// import UnitSlots from './UnitSlots'
import { Tab, Tabs } from 'react-toolbox'
import UnitTargets from './UnitTargets'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import Tooltip from 'react-toolbox/lib/tooltip'
import Translate from 'components/translate/Translate'
import NewItemWithDialog from 'components/dashboard/forms/items/NewItemWithDialog'
import NewBidSteps from 'components/dashboard/forms/bids/NewBidSteps'
import UnitBids from './UnitBids'

const TooltipButton = Tooltip(Button)
const BidFormWithDialog = NewItemWithDialog(NewBidSteps)

export class Unit extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    BasicProps = ({ item, t }) => {
        return (
            <div className={theme.itemPropTop}>
                <div className={theme.imgHolder}>
                    <Card className={theme.itemDetailCard} raised={false} theme={theme}>
                        <CardMedia
                            aspectRatio='wide'
                            theme={theme}
                        >
                            <Img src={item.imgUrl} alt={item.fullName} />
                        </CardMedia>
                        <CardActions theme={theme} >

                            <IconButton
                                /* theme={theme} */
                                icon='edit'
                                accent
                                onClick={this.props.toggleImgEdit}
                            />
                        </CardActions>
                    </Card>

                </div>
                <div className={theme.bannerProps}>
                    <div>
                        <Dropdown
                            onChange={this.props.handleChange.bind(this, 'adType')}
                            source={AdTypes}
                            value={item.adType}
                            label={t('adType', { isProp: true })}
                        />
                    </div>
                    <div>
                        <Dropdown
                            onChange={this.props.handleChange.bind(this, 'size')}
                            source={Sizes}
                            value={item.size}
                            label={t('size', { isProp: true })}
                        />
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let item = this.props.item
        let t = this.props.t

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                <BidFormWithDialog
                    btnLabel='PLACE_BID'
                    title={this.props.t('PLACE_BID_FOR', { args: [item.fullName] })}
                    floating
                    primary
                    bidId={item._id}
                    icon='check_circle'
                    adUnit={item}
                />
                <this.BasicProps item={item} t={t} />
                <div>
                    <Tabs
                        theme={theme}
                        index={this.state.tabIndex}
                        onChange={this.handleTabChange.bind(this)}
                    >
                        <Tab label={t('TARGETS')}>
                            <div>
                                <UnitTargets {...this.props} meta={item.meta} t={t} />
                            </div>
                        </Tab>
                        {/* <Tab theme={theme} label={t('SLOTS')}>
                            <div>
                                <UnitSlots item={item} />
                            </div>
                        </Tab> */}
                        <Tab label={t('BIDS')}>
                            <UnitBids item={item} />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    // account: PropTypes.object.isRequired,
    // items: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    // slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        // account: persist.account,
        // items: persist.items[ItemsTypes.AdUnit.id],
        // slots: Array.from(Object.values(persist.items[ItemsTypes.AdSlot.id])),
        // item: state.currentItem,
        spinner: memory.spinners[ItemsTypes.AdUnit.name],
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
