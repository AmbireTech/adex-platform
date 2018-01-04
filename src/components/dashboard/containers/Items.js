
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from './ItemsList'
import theme from './theme.css'
import classnames from 'classnames'
import { ItemTypesNames } from 'constants/itemsTypes'
import { getAccountItems, getItemsByType } from 'services/smart-contracts/actions/registry'
import Item from 'models/Item'

class Items extends Component {
    componentWillMount() {
        // TODO: make is as service ot util
        getAccountItems({ _addr: this.props.account._addr, _type: this.props.itemsType })
            .then((res) => {
                getItemsByType({ _type: this.props.itemsType, itemsIds: res })
                    .then((web3Items) => {
                        // get meta from ipfs
                        //TEMP
                        let items = web3Items.map((w3i) => {
                            w3i._meta = w3i._metaWeb3
                            return new Item(w3i)
                        })

                        this.props.actions.updateItems({ items: items, itemsType: this.props.itemsType })

                    })
            })
    }

    render() {
        let items = Array.from(Object.values(this.props.items)) || []
        // let items = this.props.items || []

        console.log('items', items)

        return (
            <div>
                <div className={classnames(theme.heading, theme[ItemTypesNames[this.props.itemsType]], theme.items)}>
                    <h2 > {this.props.header} {'(' + (items.filter((i) => !!i && !!i._meta && !i._meta.deleted).length) + ')'} </h2>
                </div>
                <div className={theme.panelContent}>
                    {this.props.newItemBtn ? this.props.newItemBtn() : null}
                </div>

                <ItemsList {...this.props} items={items} viewModeId={this.props.viewModeId} delete />
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
    itemsType: PropTypes.number.isRequired
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
