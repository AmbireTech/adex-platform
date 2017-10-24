
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { ItemsTypes, AdTypes, Sizes, TargetsWeight, Locations } from 'constants/itemsTypes'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import Item from 'models/Item'
import Input from 'react-toolbox/lib/input'
import theme from './theme.css'
import Autocomplete from 'react-toolbox/lib/autocomplete'
// import { Locations } from 'models/DummyData' // Temp


const autocompleteLocations = () => {
    let locs = {}
    Locations.map((loc) => {
        locs[loc.value] = loc.label
    })

    return locs
}

const AcLocations = autocompleteLocations()

export class Unit extends Component {
    renderLocationTarget = (target) =>
        <Autocomplete
            direction="auto"
            multiple={false}
            onChange={this.handleMultipleChange}
            label="Choose countries"
            source={AcLocations}
            value={null}
            suggestionMatch='anywhere'
            showSuggestionsWhenValueIsSet={true}
        />

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

                <Grid fluid>
                    <Row>
                        <Col lg={6}>
                            <Row className={theme.targetsHead}>
                                <Col lg={7}>
                                    TARGET
                                </Col>
                                <Col lg={5}>
                                    Weight
                                </Col>
                            </Row>


                            {
                                meta.targets.map((target) => {
                                    return (<Row key={target.name}>
                                        <Col lg={7}>
                                            {target.name === 'location' ?
                                                this.renderLocationTarget(target)
                                                : null
                                            }
                                        </Col>
                                        <Col lg={5}>
                                            <Dropdown
                                                source={TargetsWeight}
                                                value={target.weight}
                                                label={t('weight', { isProp: true })}
                                            />
                                        </Col>

                                    </Row>
                                    )
                                })
                            }

                        </Col>
                        <Col lg={6}>
                        </Col>
                    </Row>

                </Grid>
            </div>

        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        account: state.account,
        items: state.items[ItemsTypes.AdUnit.id],
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
