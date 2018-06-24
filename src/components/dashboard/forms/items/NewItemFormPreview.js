import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import Anchor from 'components/common/anchor/anchor'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import { items as ItemsConstants } from 'adex-constants'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { ItemsTypes, AdSizesByValue, AdTypesByValue } = ItemsConstants

class NewItemFormPreview extends Component {
    constructor(props) {
        super(props)
        this.save = props.save
    }

    SlotFallback = ({ item, t, classes }) => {
        return (
            <div>
                <PropRow
                    left={t('SLOT_FALLBACK_IMG_LABEL')}
                    right={
                        <Img
                            className={classes.imgPreview}
                            src={item.fallbackAdImg.tempUrl || ''}
                            alt={item.fallbackAdUrl}
                        />
                    }
                />
                <PropRow
                    left={t('fallbackAdUrl', { isProp: true })}
                    right={<Anchor href={item.fallbackAdUrl} target='_blank'>{item.fallbackAdUrl}</Anchor>}
                />
            </div>
        )
    }

    render() {
        const item = this.props.item || {}
        const meta = item._meta || {}
        const { t, classes } = this.props

        return (
            <ContentBox>
                <ContentBody>
                    {/* <Grid container spacing={16}> */}
                    <PropRow
                        left={t('fullName', { isProp: true })}
                        right={meta.fullName}
                    />
                    <PropRow
                        left={t('description', { isProp: true })}
                        right={item._description}
                    />
                    <PropRow
                        left={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}
                        right={
                            <Img
                                className={classes.imgPreview}
                                src={meta.img.tempUrl || ''}
                                alt={meta.fullName}
                            />
                        }
                    />
                    {item._type === ItemsTypes.AdSlot.id &&
                        <this.SlotFallback item={item} t={t} classes={classes} />
                    }
                    {
                        Object
                            .keys(meta)
                            .filter((key) => !/fullName|description|items|img|createdOn|modifiedOn|deleted|archived|banner|name|owner|type|targets/.test(key))
                            .map(key => {
                                let keyName = key
                                let value = meta[key]

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

                    {/* </Grid> */}
                    <br />
                </ContentBody>
            </ContentBox>
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
    const persist = state.persist
    // const memory = state.memory
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

const NewItemPreview = NewItemHoc(withStyles(styles)(NewItemFormPreview))
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewItemPreview))
