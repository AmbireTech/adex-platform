
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { AdUnit } from 'adex-models'
import { Grid, Row, Col } from 'react-flexbox-grid'
import classnames from 'classnames'
import { items as ItemsConstants } from 'adex-constants'
import FontIcon from 'react-toolbox/lib/font_icon'

const { ItemsTypes } = ItemsConstants

export class UnitTargets extends Component {


    targetArrayValues = (value) => (
        <div>
            {
                value.join(', ')
            }
        </div>
    )

    ageTargets = (value) => (
        <div>
            <span> From:  </span>
            <span> {value.from} </span>
            <span> To:  </span>
            <span> {value.to}  </span>
        </div>
    )

    TargetsNoEdit = ({ meta, t }) => {
        return (
            <Grid fluid>
                {
                    (meta.targets || []).map((target) => {
                        return (
                            <Row key={target.name}>
                                <Col lg={2}>
                                    <strong> {target.name} </strong>
                                </Col>
                                <Col lg={1}>
                                    <div>
                                        <FontIcon value='equalizer' style={{ color: 'deepskyblue' }} />
                                        <span>{target.weight} </span>
                                    </div>
                                </Col>
                                <Col lg={9}>
                                    {(() => {
                                        switch (target.name) {
                                            case 'location':
                                                return this.targetArrayValues(target.value)
                                            case 'gender':
                                                return this.targetArrayValues(target.value)
                                            case 'age':
                                                return this.ageTargets(target.value)
                                            default: null
                                        }
                                    })()}
                                </Col>
                            </Row>
                        )
                    })
                }
            </Grid>
        )
    }


    render() {
        return (
            <this.TargetsNoEdit meta={this.props.meta} t={this.props.t} />
        )
    }
}

UnitTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        slots: [], // Array.from(Object.values(persist.items[ItemsTypes.AdSlot.id])),
        spinner: memory.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

// const UnitItem = ItemHoc(UnitSlots)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitTargets);
