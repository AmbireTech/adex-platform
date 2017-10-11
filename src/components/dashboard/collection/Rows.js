import React, { Component } from 'react'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Tooltip from 'react-toolbox/lib/tooltip'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Img from 'components/common/img/Img'
import { ItemTypesNames } from 'constants/itemsTypes'

// import classnames from 'classnames';

// const RRButton = withReactRouterLink(Button)

const RRTableCell = withReactRouterLink(TableCell)

const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)
const TooltipButton = Tooltip(Button)

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
                        multiSelectable
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
