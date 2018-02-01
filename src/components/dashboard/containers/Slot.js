import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Item, AdSlot } from 'adex-models'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import Input from 'react-toolbox/lib/input'
import theme from './theme.css'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import Slider from 'react-toolbox/lib/slider'
import classnames from 'classnames'
import { Tab, Tabs } from 'react-toolbox'
import SlotBids from './SlotBids'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { IconButton, Button } from 'react-toolbox/lib/button'
import { items as ItemsConstants } from 'adex-constants'
import { BasicProps } from './ItemCommon'

const { ItemsTypes, AdTypes, AdSizes } = ItemsConstants

const IntegrationCode = ({ ipfs, t, size }) => {
    let src = `adview.adex.network/${ipfs}` //TODO: Set real src with config !!!
    let sizes = size.split('x')
    sizes = {
        width: sizes[0],
        height: sizes[1]
    }
    let iframeStr =
        `<iframe src="${src}"\n` +
        `   width="${sizes.width}"\n` +
        `   height="${sizes.height}"\n` +
        `   scrolling="no"\n` +
        `   frameborder="0"\n` +
        `   style="border: 0;"\n` +
        `></iframe>`

    // TODO: Add copy to clipboard and tooltip or description how to use it
    return (
        <div>
            <div className={theme.integrationLabel}> {t('INTEGRATION_CODE')}</div>
            <pre className={theme.integrationCode}>
                {iframeStr}
            </pre>
        </div>
    )
}

export class Slot extends Component {
    render() {
        let item = this.props.item
        let t = this.props.t
        console.log('item', item)

        if (!item) return (<h1>Slot '404'</h1>)

        return (
            <div>
                <BasicProps item={item} t={t} rightComponent={<IntegrationCode ipfs={item.ipfs} size={item.sizeTxtValue} t={t} />} />
                <div>
                    <SlotBids {...this.props} item={item} t={t} />
                </div>
            </div>

        )
    }
}

Slot.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        // items: Array.from(Object.values(persist.items[ItemsTypes.AdSlot.id])),
        spinner: memory.spinners[ItemsTypes.AdSlot.name],
        objModel: AdSlot,
        itemType: ItemsTypes.AdSlot.id
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
)(SlotItem)
