import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'

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
		let newSelected = selected.map((index) => this.props.rows[index].id)
		this.setState({ selected: newSelected });
	}

	render() {
		const { side, rows, padding, itemType } = this.props
		return (
			<div>
				<Table
					padding={padding || 'default'}
				>
					{this.props.tableHeadRenderer({ selected: this.state.selected })}
					<TableBody>
						{
							rows.map((u, i) => {
								let to = `/dashboard/${side}/${itemType}/${u.id || u.ipfs}`
								let selected = this.state.selected.indexOf(u.id) !== -1
								return (
									this.props.rowRenderer(u, i, { to, selected, itemType })
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
