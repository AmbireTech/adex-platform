
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
import Item from 'models/Item'
import theme from './theme.css'
// import { IconButton, Button } from 'react-toolbox/lib/button'
import UnitSlots from './UnitSlots'
import { Tab, Tabs } from 'react-toolbox'
import UnitTargets from './UnitTargets'

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

    BasicProps = ({ meta, t }) => {
        return (<div className={theme.itemPropTop}>
            <div className={theme.imgHolder}>
                <Img src={Item.getImgUrl(meta.img)} alt={meta.fullName} className={theme.img} />
            </div>
            <div className={theme.bannerProps}>
                <div>
                    <Dropdown
                        onChange={this.props.handleChange.bind(this, 'adType')}
                        source={AdTypes}
                        value={meta.adType}
                        label={t('adType', { isProp: true })}
                    />
                </div>
                <div>
                    <Dropdown
                        onChange={this.props.handleChange.bind(this, 'size')}
                        source={Sizes}
                        value={meta.size}
                        label={t('size', { isProp: true })}
                    />
                </div>
            </div>
        </div>
        )
    }

    render() {
        let item = this.props.item
        let meta = item._meta
        let t = this.props.t

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                <this.BasicProps meta={meta} t={t} />
                <div>
                    <Tabs
                        theme={theme}
                        fixed
                        index={this.state.tabIndex}
                        onChange={this.handleTabChange.bind(this)}
                        inverse
                    >
                        <Tab label='TARGETS'>
                            <div>
                                <UnitTargets {...this.props} meta={meta} t={t} />
                            </div>
                        </Tab>
                        <Tab theme={theme} label='SLOTS'>
                            <div>
                                <UnitSlots item={item} />
                            </div>
                        </Tab>
                        <Tab label='BIDS'>
                            <div> render bids here </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        account: state.account,
        items: state.items[ItemsTypes.AdUnit.id],
        slots: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const UnitItem = ItemHoc(Unit)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitItem);
