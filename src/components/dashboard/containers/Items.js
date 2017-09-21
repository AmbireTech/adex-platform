
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import SomeList from './../../list/SomeList'

class Items extends Component {
    render() {
        // let side = this.props.match.params.side // set side in state ?

        let items = this.props.items

        return (
            <div>
                <h1> {this.props.header} </h1>
                <div>
                    {this.props.newItemBtn()}
                </div>

                <SomeList items={items} viewModeId={this.props.viewModeId} />
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
    // console.log('mapStateToProps Items', state)
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
