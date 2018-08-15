import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from 'components/dashboard/containers/ItemsList'
import Translate from 'components/translate/Translate'

class Items extends Component {

    componentWillMount() {
        const items = Array.from(Object.values(this.props.items || {})) || []
        this.props.actions.updateNav('navTitle', this.props.header)
    }

    render() {
        const items = Array.from(Object.values(this.props.items || {})) || []
        // let items = this.props.items || []

        return (
            <div>
                {!!this.props.newItemBtn && <this.props.newItemBtn />}
                <ItemsList
                    {...this.props}
                    items={items}
                    viewModeId={this.props.viewModeId}
                    archive
                />
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
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        items: persist.items[props.itemsType],
        side: memory.nav.side,
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
)(Translate(Items))
