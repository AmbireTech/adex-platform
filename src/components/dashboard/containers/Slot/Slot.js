import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { AdSlot } from 'adex-models'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import theme from './theme.css'
import SlotBids from 'components/dashboard/containers/Bids/SlotBids'
import { items as ItemsConstants } from 'adex-constants'
import { BasicProps } from 'components/dashboard/containers/ItemCommon'
import Helper from 'helpers/miscHelpers'
import ImgDialog from 'components/dashboard/containers/ImgDialog'
import { Item as ItemModel } from 'adex-models'
import { AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT } from 'constants/misc'

const { ItemsTypes, AdSizesByValue } = ItemsConstants
const ADVIEW_URL = process.env.ADVIEW_HOST || 'https://view.adex.network'

const IntegrationCode = ({ ipfs, t, size, slotId, slotIpfs, fallbackImgIpfs, fallbackUrl }) => {

    let sizes = size.split('x')
    sizes = {
        width: sizes[0],
        height: sizes[1]
    }

    let queryParmas = {
        width: sizes.width,
        height: sizes.height,
        slotId: slotId,
        slotIpfs: slotIpfs,
        fallbackImgIpfs: fallbackImgIpfs,
        fallbackUrl: fallbackUrl || ''
    }

    let query = Helper.getQuery(queryParmas)

    let src = ADVIEW_URL + query

    let iframeStr =
        `<iframe src="${src}"\n` +
        `   width="${sizes.width}"\n` +
        `   height="${sizes.height}"\n` +
        `   scrolling="no"\n` +
        `   frameBorder="0"\n` +
        `   style="border: 0;"\n` +
        `></iframe>`

    // TODO: Add copy to clipboard and tooltip or description how to use it
    return (
        <div>
            <div className={theme.integrationLabel}> {t('INTEGRATION_CODE')}</div>
            <pre className={theme.integrationCode}>
                {iframeStr}
            </pre>
            <div>
                <br />
                <div className={theme.integrationLabel}> {t('AD_PREVIEW')}</div>
                <div dangerouslySetInnerHTML={{ __html: iframeStr }} />
            </div>
        </div>
    )
}

export class Slot extends Component {

    constructor(props) {
        super(props)
        this.state = {
            editFallbackImg: false
        }
    }

    handleFallbackImgUpdateToggle = () => {
        let active = this.state.editFallbackImg
        this.setState({ editFallbackImg: !active })
    }

    render() {
        let item = this.props.item || {}
        let t = this.props.t

        if (!item._id) return (<h1>Slot '404'</h1>)

        let imgSrc = item.fallbackAdImg.tempUrl || ItemModel.getImgUrl(item.fallbackAdImg, process.env.IPFS_GATEWAY) || ''
        return (
            <div>
                <BasicProps
                    {...this.props}
                    item={item}
                    t={t}
                    toggleImgEdit={this.props.toggleImgEdit}
                    toggleFallbackImgEdit={this.handleFallbackImgUpdateToggle}
                    canEditImg
                    rightComponent={<IntegrationCode
                        ipfs={item.ipfs}
                        size={item.sizeTxtValue}
                        t={t}
                        slotId={item.id}
                        slotIpfs={item.ipfs}
                        fallbackImgIpfs={(item.fallbackAdImg || {}).ipfs}
                        fallbackUrl={item.fallbackAdUrl}
                    />}
                />
                <ImgDialog
                    {...this.props}
                    imgSrc={imgSrc}
                    handleToggle={this.handleFallbackImgUpdateToggle}
                    active={this.state.editFallbackImg}
                    onChangeReady={this.props.handleChange}
                    validateId={item._id}
                    width={AdSizesByValue[item.size].width}
                    height={AdSizesByValue[item.size].height}
                    title={t('SLOT_FALLBACK_IMG_LABEL')}
                    additionalInfo={t('SLOT_FALLBACK_IMG_INFO', { args: [AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'px'] })}
                    exact={true}
                    required={true}
                    errMsg={t('ERR_IMG_SIZE_EXACT')}
                    imgPropName='fallbackAdImg'
                />
                <div>
                    <SlotBids {...this.props} item={item} t={t} getSlotBids={true} />
                </div>
            </div>
        )
    }
}

Slot.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        objModel: AdSlot,
        itemType: ItemsTypes.AdSlot.id,
        // NOTE: maybe not the best way but pass props to the HOC here
        updateImgInfoLabel: 'SLOT_AVATAR_IMG_INFO',
        updateImgLabel: 'SLOT_AVATAR_IMG_LABEL',
        updateImgErrMsg: 'ERR_IMG_SIZE_MAX',
        updateImgExact: false,
        canEditImg: true, // TEMP: we can edit slot avatar,
        updateImgWidth: AVATAR_MAX_WIDTH,
        updateImgHeight: AVATAR_MAX_HEIGHT
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const SlotItem = ItemHoc(Slot)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SlotItem)
