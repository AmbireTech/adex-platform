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

class NewItemFormPreview extends Component {
    constructor(props) {
        super(props)
        this.save = props.save
    }

    render() {
        let item = this.props.item || {}
        let meta = item._meta || {}
        let t = this.props.t

        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{<Img className={theme.imgPreview} src={meta.img.tempUrl || ''} alt={meta.fullName} />} </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{t('fullName', { isProp: true })}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{meta.fullName}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{t('description', { isProp: true })}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{meta.description}</Col>
                    </Row>
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

                                return (
                                    <Row key={key}>
                                        <Col xs={12} lg={4} className={theme.textRight}>{t(keyName, { isProp: true })}:</Col>
                                        <Col xs={12} lg={8} className={theme.textLeft}>{value}</Col>
                                    </Row>
                                )
                            })
                    }
                    {meta.targets ?
                        <Row>
                            <Col xs={12} lg={4} className={theme.textRight}>{t('targets', { isProp: true })}:</Col>
                            <Col xs={12} lg={8} className={theme.textLeft}><UnitTargets {...this.props} targets={meta.targets} t={t} /></Col>
                        </Row>
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
    let memory = state.memory
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
