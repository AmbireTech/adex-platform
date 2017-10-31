import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes, AdTypes, Sizes, TargetsWeight, Locations, TargetWeightLabels, Genders } from 'constants/itemsTypes'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import Item from 'models/Item'
import Input from 'react-toolbox/lib/input'
import theme from './theme.css'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import Slider from 'react-toolbox/lib/slider'
import classnames from 'classnames'
import { Tab, Tabs } from 'react-toolbox'
import SlotBids from './SlotBids'

export class Slot extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }
    
    render() {
        let item = this.props.item
        let meta = item._meta
        let t = this.props.t

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                <div className={theme.itemPropTop}>
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
                <div>
                    <Tabs
                        theme={theme}
                        fixed
                        index={this.state.tabIndex}
                        onChange={this.handleTabChange.bind(this)}
                        inverse
                    >
                        <Tab label='BIDS'>
                            <div>
                                <SlotBids {...this.props} meta={meta} t={t} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>

        )
    }
}

Slot.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        account: state.account,
        items: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdSlot.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const SlotItem = ItemHoc(Slot)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SlotItem);
