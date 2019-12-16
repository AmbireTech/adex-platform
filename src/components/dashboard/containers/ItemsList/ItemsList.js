import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import SortingTable from 'components/dashboard/containers/Tables/SortingTable'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

// DEPRECATED
class ItemsList extends Component {
	render() {
		const { items, itemType } = this.props
		return <SortingTable itemType={itemType} items={items} />
	}
}

ItemsList.propTypes = {
	// actions: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	// viewModeId: PropTypes.string.isRequired,
	// header: PropTypes.string,
	// objModel: PropTypes.func.isRequired,
	// itemType: PropTypes.string.isRequired,
	// sortProperties: PropTypes.array.isRequired,
	// selectedItems: PropTypes.object,
	// selectMode: PropTypes.bool,
	// onSelect: PropTypes.func,
	// noControls: PropTypes.bool,
	// noActions: PropTypes.bool,
}

function mapStateToProps(state, props) {
	const memory = state.memory
	return {
		side: memory.nav.side,
		selectedItems: props.selectedItems || {},
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(ItemsList)))
