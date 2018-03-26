import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from './ItemsList'
import theme from './theme.css'
import classnames from 'classnames'
import { getItems } from 'services/adex-node/actions'
import { Models } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames } = ItemsConstants

class Items extends Component {
    componentWillMount() {
        //TODO: Decide when to load items
        getItems({ type: this.props.itemsType, authSig: this.props.account._authSig })
            .then((items) => {
                items = items.map((item) => {
                    let mapped = { ...(new Models.itemClassByTypeId[item._type || item._meta.type](item)) } // TODO: maybe new instance of item class or make sure to keep consistency with the models on the node (without using the model on the node)
                    return mapped
                })
                this.props.actions.updateItems({ items: items, itemsType: this.props.itemsType })
            })
            .catch((err) => {
                this.props.actions.addToast({ type: 'warning', action: 'X', label: err, timeout: 5000 })
            })
    }

    render() {
        let items = Array.from(Object.values(this.props.items || {})) || []
        // let items = this.props.items || []

        return (
            <div>
                <div className={classnames(theme.heading, theme[ItemTypesNames[this.props.itemsType]], theme.items)}>
                    <h2 > {this.props.header} {'(' + (items.filter((i) => !!i && !!i._meta && !i._deleted && !i._archived).length) + ')'} </h2>
                </div>
                <div className={theme.panelContent}>
                    {this.props.newItemBtn ? this.props.newItemBtn() : null}
                </div>

                <ItemsList {...this.props} items={items} viewModeId={this.props.viewModeId} archive />
            </div>
        )
    }
}

Items.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    viewModeId: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    objModel: PropTypes.func.isRequired,
    itemsType: PropTypes.number.isRequired,
    sortProperties: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        items: persist.items[props.itemsType]
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
)(Items)
