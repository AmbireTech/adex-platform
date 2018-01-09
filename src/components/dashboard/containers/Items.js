
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
import Base from 'models/Base'
import { ItemModelsByType } from 'constants/itemsTypes'

// TEMP
const syncItems = (web3Items, storeItems) => {
    let synced = {}

    for (let index = 0; index < web3Items.length; index++) {
        let web3Item = web3Items[index]
        let storeItem = storeItems[web3Item._id] || storeItems[web3Item._ipfs]

        if (storeItem) {
            Item.syncWithWeb3(storeItem, web3Item)
        }
    }
}

const syncItemsIpfsMeta = (items, metas) => {
    if (!items || !metas || (items.length !== metas.length)) throw ('Sync ipfs meta err')

    let synced = []
    for (let index = 0; index < items.length; index++) {
        let item = items[index]
        let meta = metas[index]
        //TODO: add ipf synced prop

        let updated = Base.updateObject({ item: item, meta: { ...meta }, objModel: ItemModelsByType[item._type] })
        synced.push(updated)
    }

    return synced
}

class Items extends Component {
    componentWillMount() {
        // TODO: make is as service or util

        let web3ItemsMemo

        getAccountItems({ _addr: this.props.account._addr, _type: this.props.itemsType })
            .then((res) => {
                getItemsByType({ _type: this.props.itemsType, itemsIds: res })
                    .then((web3Items) => {
                        //TEMP
                        let items = web3Items.map((w3i) => {
                            w3i._meta = w3i._metaWeb3
                            return new Item(w3i)
                        })

                        //TODO: !!
                        // syncItems(items, this.props.items)
                        web3ItemsMemo = items
                        return items
                    })
                    .then((items) => {
                        let allMetas = []
                        for (let index = 0; index < items.length; index++) {
                            const ipfs = items[index]._ipfs
                            allMetas.push(fetch(Base.getIpfsMetaUrl(ipfs)))
                        }

                        return Promise.all(allMetas)
                    })
                    .then((metaas) => {
                        let mapped = metaas.map((res) => {
                            let body = res.json()

                            return body
                        })

                        return Promise.all(mapped)
                    })
                    .then((results) => {
                        let updated = syncItemsIpfsMeta(web3ItemsMemo, results)

                        return updated
                    })
                    .then((synced) => {
                        this.props.actions.updateItems({ items: synced, itemsType: this.props.itemsType })
                    })
            })
    }

    render() {
        console.log('this.props.items', this.props.items)
        let items = Array.from(Object.values(this.props.items || {})) || []
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
