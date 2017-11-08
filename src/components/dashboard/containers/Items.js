
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from './ItemsList'
import theme from './theme.css'
import classnames from 'classnames'
import { ItemTypesNames } from 'constants/itemsTypes'

class Items extends Component {
    render() {
        let items = this.props.items || []

        return (
            <div>
                <div className={classnames(theme.heading, theme[ItemTypesNames[this.props.itemsType]], theme.items)}>
                    <h2 > {this.props.header} {'(' + (items.filter((i) => !!i && !!i._meta && !i._meta.deleted).length) + ')'} </h2>
                </div>
                <div className={theme.panelContent}>
                    {this.props.newItemBtn ? this.props.newItemBtn() : null}
                </div>

                <ItemsList items={items} viewModeId={this.props.viewModeId} delete />
            </div>
        )
    }
}

Items.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    viewModeId: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
};

function mapStateToProps(state, props) {
    return {
        account: state.account,
        items: state.items[props.itemsType]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Items);
