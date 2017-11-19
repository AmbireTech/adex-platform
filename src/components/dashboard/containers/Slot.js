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
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import { IconButton, Button } from 'react-toolbox/lib/button'

export class Slot extends Component {

    integrationCode = () => {
        let src = `adview.adex.network/${this.props.item._id}` //TODO: Set real src with config !!!
        let sizes = this.props.item._meta.size.split('x')
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
                <div className={theme.integrationLabel}> {this.props.t('INTEGRATION_CODE')}</div>
                <pre className={theme.integrationCode}>
                    {iframeStr}
                </pre>
            </div>
        )
    }

    render() {
        let item = this.props.item
        let meta = item._meta
        let t = this.props.t

        if (!item) return (<h1>Slot '404'</h1>)

        return (
            <div>
                <div className={theme.itemPropTop}>
                    <Grid fluid style={{ padding: 0 }}>
                        <Row top='xs'>
                            <Col xs={12} sm={12} md={12} lg={7}>
                                <div className={theme.imgHolder}>
                                    <Card className={theme.itemDetailCard} raised={false} theme={theme}>
                                        <CardMedia
                                            aspectRatio='wide'
                                            theme={theme}
                                        >
                                            <Img src={Item.getImgUrl(meta.img)} alt={meta.fullName} />
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
                                    {/* <Img src={Item.getImgUrl(meta.img)} alt={meta.fullName} className={theme.img} /> */}
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
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={5}>
                                <this.integrationCode />
                            </Col>
                        </Row>
                    </Grid>
                </div>
                <div>
                    <SlotBids {...this.props} meta={meta} t={t} />
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
    state = state.storage
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
)(SlotItem)
