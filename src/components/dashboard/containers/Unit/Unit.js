import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import { AdUnit } from 'adex-models'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import Translate from 'components/translate/Translate'
import { BasicProps } from 'components/dashboard/containers/ItemCommon'

export class Unit extends Component {
	constructor(props) {
		super(props)
		this.state = {
			closeDialog: false,
		}
	}
	// shouldComponentUpdate(nextProps, nextState) {
	//     let diffProps = JSON.stringify(this.props) !== JSON.stringify(nextProps)
	//     let diffState = JSON.stringify(this.state) !== JSON.stringify(nextState)
	//     return diffProps || diffState
	// }
	render() {
		const { item, t, ...rest } = this.props

		if (!item) return <h1>Unit '404'</h1>

		return (
			<div>
				<BasicProps
					item={item}
					t={t}
					url={item.adUrl}
					rightComponent={
						<UnitTargets
							{...rest}
							targets={item.targeting}
							t={t}
							subHeader={true}
						/>
					}
				/>
			</div>
		)
	}
}

Unit.propTypes = {
	actions: PropTypes.object.isRequired,
	item: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
	return {
		objModel: AdUnit,
		itemType: 'AdUnit',
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const UnitItem = ItemHoc(Unit)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(UnitItem))
