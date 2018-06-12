import React, { Component } from 'react'
// import theme from './theme.css'
import { items as ItemsConstants } from 'adex-constants'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

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
        let item = this.props.item
        let meta = item.meta || {}
        let rows = this.props.rows
        return (
            <div>
                <h1> {meta.fullName} </h1>
                <div>
                    <Table
                    // theme={theme}
                    // multiSelectable={this.props.multiSelectable === true}
                    // selectable={this.props.selectable === true}
                    // onRowSelect={this.handleRowSelect}
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
            </div>
        )
    }
}

export default Rows
