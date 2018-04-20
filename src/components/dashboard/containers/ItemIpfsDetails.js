import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { AdSlot } from 'adex-models'
import ItemHoc from './ItemHoc'
import theme from './theme.css'
import SlotBids from './SlotBids'
import { items as ItemsConstants } from 'adex-constants'
import { BasicProps } from './ItemCommon'
import Helper from 'helpers/miscHelpers'
import ImgDialog from './ImgDialog'
import { Item as ItemModel } from 'adex-models'
import { AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT } from 'constants/misc'
import { Item } from 'adex-models'
import { PropRow, ContentBox, ContentBody, ContentStickyTop, FullContentSpinner } from 'components/common/dialog/content'
import Anchor from 'components/common/anchor/anchor'

const { ItemsTypes, AdSizesByValue, AdTypesByValue } = ItemsConstants
const ADVIEW_URL = process.env.ADVIEW_HOST || 'https://view.adex.network'

export class ItemIpfsDetails extends Component {

    constructor(props) {
        super(props)
        this.state = {
            itemData: null,
            itemIpfsUrl: Item.getIpfsMetaUrl(this.props.itemIpfs, process.env.IPFS_GATEWAY)
        }
    }

    componentWillMount() {
        this.props.actions.updateSpinner(this.props.itemIpfs, true)

        fetch(this.state.itemIpfsUrl)
            .then((res) => {
                return res.json()
            })
            .then((res) => {
                this.setState({ itemData: res })
                this.props.actions.updateSpinner(this.props.itemIpfs, false)
            })
            .catch((err) => {
                console.log('err', err)
            })
    }

    slotProps

    render() {
        let item = this.props.item || {}
        let t = this.props.t

        const itemData = this.state.itemData

        console.log('slotData', itemData)
        return (
            <ContentBox>
                {!!this.props.spinner || !itemData ?
                    <FullContentSpinner />
                    :
                    <ContentBody>
                        <Grid fluid style={{ padding: 0 }}>
                            <PropRow
                                left={t('PROP_FULLNAME')}
                                right={itemData.fullName}
                            />
                            <PropRow
                                left={t('PROP_OWNER')}
                                right={<Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + itemData.owner} > {itemData.owner || '-'} </Anchor>}
                            />
                            <PropRow
                                left={t('PROP_ADTYPE')}
                                right={AdTypesByValue[itemData.adType].label}
                            />
                            <PropRow
                                left={t('PROP_SIZE')}
                                right={t(AdSizesByValue[itemData.size].label, { args: AdSizesByValue[itemData.size].labelArgs })}
                            />
                            <PropRow
                                left={t('SLOT_IPFS')}
                                right={<Anchor target='_blank' href={this.state.itemIpfsUrl} > {this.props.itemIpfs} </Anchor>}
                            />
                        </Grid>

                    </ContentBody>
                }
            </ContentBox>

        )
    }
}

ItemIpfsDetails.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    itemIpfs: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    const memory = state.memory
    return {
        spinner: memory.spinners[props.itemIpfs],
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
)(ItemIpfsDetails)
