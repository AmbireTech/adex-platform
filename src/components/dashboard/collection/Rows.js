import React, { Component } from 'react'
import { items as ItemsConstants } from 'adex-constants'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'

const { ItemTypesNames } = ItemsConstants

class Rows extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			// TODO: maybe in the store?
			selected: []
		}
	}

	componentWillReceiveProps(nextProps) {
		// Reset selected
		// TODO: make better check because this will always  return true
		if (nextProps.rows !== this.props.rows) {
			this.setState({ selected: [] })
		}
	}

	handleRowSelect = (selected) => {
		let newSelected = selected.map((index) => this.props.rows[index]._id)
		this.setState({ selected: newSelected });
	}

	render() {
		let side = this.props.side
		let rows = this.props.rows
		return (
			<div>
				<Table
				// theme={theme}
				>
					{this.props.tableHeadRenderer({ selected: this.state.selected })}
					<TableBody>
						{
							rows.map((u, i) => {
								let to = '/dashboard/' + side + '/' + ItemTypesNames[u._type] + '/' + u._id
								let selected = this.state.selected.indexOf(u._id) !== -1
								return (
									this.props.rowRenderer(u, i, { to: to, selected: selected })
								)
							})
						}
					</TableBody>
				</Table>
			</div>
		)
	}
}

export default Rows
