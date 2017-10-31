import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './theme.css'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import Item from 'models/Item'

class NewItemFormPreview extends Component {
    constructor(props) {
        super(props)
        this.save = props.save
    }

    render() {
        let item = this.props.item || {}
        let meta = item._meta || {}
        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{<Img className={theme.imgPreview} src={meta.img.tempUrl || ''} alt={meta.fullName} />} </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('fullName', { isProp: true })}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{meta.fullName}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('description', { isProp: true })}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{meta.description}</Col>
                    </Row>
                    {
                        Object
                            .keys(meta)
                            .filter((key) => !/fullName|description|items|img|createdOn|modifiedOn|deleted|archived|banner/.test(key))
                            .map(key => {
                                let keyName = key
                                let value = item._meta[key]

                                if (!!value && moment(value).isValid()) {
                                    value = moment(value).format('D MMMM YYYY')
                                }

                                return (
                                    <Row key={key}>
                                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t(keyName, { isProp: true })}:</Col>
                                        <Col xs={12} lg={3} className={theme.textLeft}>{value}</Col>
                                    </Row>
                                )
                            })
                    }
                </Grid>
                <br />

                {/* <Button icon='save' label='Save' raised primary onClick={this.props.save} /> */}
            </div>
        )
    }
}

NewItemFormPreview.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired
}

function mapStateToProps(state) {
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.AdUnit.id],
        items: state.items[ItemsTypes.AdUnit.id]
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
