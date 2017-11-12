import React, { Component } from 'react'
import theme from './theme.css'
import { Table } from 'react-toolbox/lib/table'
import { ItemTypesNames } from 'constants/itemsTypes'

class Rows extends Component {
    constructor(props, context) {
        super(props, context);

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
        let rows = this.props.rows
        return (
            <div>
                <h1> {item._name} </h1>
                <div>
                    <Table
                        theme={theme}
                        multiSelectable={this.props.multiSelectable === true}
                        selectable={this.props.selectable === true}
                        onRowSelect={this.handleRowSelect}
                    >
                        {this.props.tableHeadRenderer({ selected: this.state.selected })}

                        {rows.map((u, i) => {
                            let to = '/dashboard/' + side + '/' + ItemTypesNames[u._type] + '/' + u._id
                            let selected = this.state.selected.indexOf(u._id) !== -1
                            return (
                                this.props.rowRenderer(u, i, { to: to, selected: selected })
                            )
                        })
                        })}

                </Table>
                </div>
            </div>
        );
    }
}

export default Rows;
