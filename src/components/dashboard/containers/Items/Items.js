import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import EnhancedTable from 'components/dashboard/containers/Tables/EnhancedTable'
import Translate from 'components/translate/Translate'

class Items extends Component {
	componentWillMount() {
		this.props.actions.updateNav('navTitle', this.props.header)
	}

	render() {
		const { itemType } = this.props
		const items = Object.values(this.props.items || {}) || []

		return (
			<div>
				<EnhancedTable itemType={itemType} items={items} />
			</div>
		)
	}
}

Items.propTypes = {
	actions: PropTypes.object.isRequired,
	items: PropTypes.object.isRequired,
	header: PropTypes.string.isRequired,
	itemType: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
	const { persist, memory } = state
	return {
		items: persist.items[props.itemType] || [],
		side: memory.nav.side,
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
)(Translate(Items))
