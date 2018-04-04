import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './../theme.css'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import Anchor from 'components/common/anchor/anchor'
import { PropRow } from 'components/dashboard/forms/FormsCommon'
import { items as ItemsConstants } from 'adex-constants'
const { ItemsTypes, AdSizesByValue, AdTypesByValue } = ItemsConstants

class NewItemFormPreview extends Component {
    constructor(props) {
        super(props)
        this.save = props.save
    }

    SlotFallback = ({ item, t }) => {
        return (
            <div>
                <PropRow
                    left={t('SLOT_FALLBACK_IMG_LABEL')}
                    right={<Img className={theme.imgPreview} src={item.fallbackAdImg.tempUrl || ''} alt={item.fallbackAdUrl} />}
                />
                <PropRow
                    left={t('fallbackAdUrl', { isProp: true })}
                    right={<Anchor href={item.fallbackAdUrl} target='_blank'>{item.fallbackAdUrl}</Anchor>}
                />
            </div>
        )
    }

    render() {
        let item = this.props.item || {}
        let meta = item._meta || {}
        let t = this.props.t

        return (
            <div>
                <Grid fluid>
                    <PropRow
                        left={t('fullName', { isProp: true })}
                        right={meta.fullName}
                    />
                    <PropRow
                        left={t('description', { isProp: true })}
                        right={meta._description}
                    />
                    <PropRow
                        left={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}
                        right={<Img className={theme.imgPreview} src={meta.img.tempUrl || ''} alt={meta.fullName} />}
                    />
                    {
                        item._type === ItemsTypes.AdSlot.id ?
                            <this.SlotFallback item={item} t={t} />
                            : null
                    }
                    {
                        Object
                            .keys(meta)
                            .filter((key) => !/fullName|description|items|img|createdOn|modifiedOn|deleted|archived|banner|name|owner|type|targets/.test(key))
                            .map(key => {
                                let keyName = key
                                let value = item._meta[key]

                                if (!value) {
                                    return null
                                }

                                if (!!/from|to/.test(key)) {
                                    value = moment(value).format('D MMMM YYYY')
                                }

                                if (keyName === 'size') {
                                    value = t(AdSizesByValue[value].label, { args: AdSizesByValue[value].labelArgs })
                                }

                                if (keyName === 'adType') {
                                    value = AdTypesByValue[value].label
                                }

                                return (
                                    <PropRow key={key}
                                        left={t(keyName, { isProp: true })}
                                        right={value}
                                    />
                                )
                            })
                    }
                    {meta.targets ?
                        <PropRow
                            left={t('targets', { isProp: true })}
                            right={<UnitTargets {...this.props} targets={meta.targets} t={t} />}
                        />
                        : null
                    }

                </Grid>
                <br />
            </div>
        )
    }
}

NewItemFormPreview.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        // newItem: memory.newItem[ItemsTypes.AdUnit.id]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const NewItemPreview = NewItemHoc(NewItemFormPreview)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewItemPreview))
