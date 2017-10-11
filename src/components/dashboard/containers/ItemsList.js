import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { IconButton, Button } from 'react-toolbox/lib/button'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import { Pagination } from './ListControls'
import Rows from 'components/dashboard/collection/Rows'
import Card from 'components/dashboard/collection/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import theme from './theme.css'
import tableTheme from 'components/dashboard/collection/theme.css'

import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from 'components/common/img/Img'

const RRTableCell = withReactRouterLink(TableCell)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)
const TooltipButton = Tooltip(Button)

const SORT_PROPERTIES = [
    { value: '_id', label: 'Id' },
    { value: '_name', label: 'Short Name' },
    { value: 'fullName', label: 'Full name' },
    { value: 'modifiedOn', label: 'Date modified' },
    { value: 'createdOn', label: 'Date created' }
]

const List = ({ list, itemRenderer }) => {
    return (<div className="list">
        {list.map((item, index) => itemRenderer(item, index))}
    </div>)
}

class ItemsList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            items: [],
            page: 0,
            pageSize: 10,
            isLoading: false,
            isError: false,
            search: '',
            sortOrder: -1,
            sortProperty: SORT_PROPERTIES[0].value,
            filteredItems: []
        }

        this.renderCard = this.renderCard.bind(this)
    }

    toggleView(value) {
        if (value !== this.props.rowsView) {
            this.props.actions.updateUi(this.props.viewModeId, !!value)
        }
    }

    goToPage(page) {
        this.setState({ page: parseInt(page, 10) })
    }

    handleChange = (name, value) => {
        let newStateValue = { [name]: value }
        if (name === 'search') newStateValue.page = 0
        this.setState(newStateValue);
    }

    changePageSize = (name, { itemsLength, page, pages } = {}, newPageSize) => {
        let currentPageSize = this.state.pageSize
        let currentFirstIndex = page * currentPageSize // To have at least the first item on current page on the next page
        let nextPage = Math.floor(currentFirstIndex / newPageSize)
        this.setState({ page: nextPage, pageSize: newPageSize })
    }

    renderCard(item, index) {
        return (
            <Card
                key={item._id}
                item={item}
                name={item._name}
                logo={item._meta.img}
                side={this.props.side}
                delete={this.props.actions.confirmAction.bind(this,
                    this.props.actions.deleteItem.bind(this, item),
                    null,
                    {
                        confirmLabel: 'Yes',
                        cancelLabel: 'No',
                        title: 'Delete Item - ' + item._name,
                        text: 'Are you sure?'
                    })}
                remove={null}
                actionsRenderer={this.renderActions(item)}

            />
        )
    }

    renderTableHead({ selected }) {
        return (
            <TableHead>
                <TableCell>
                    {selected.length ?
                        <TooltipButton
                            icon='delete'
                            label='delete selected'
                            accent
                            onClick={null}
                            tooltip='Delete all'
                            tooltipDelay={1000}
                            tooltipPosition='top' />
                        :
                        'Select all'
                    }
                </TableCell>
                <TableCell> Name </TableCell>
                <TableCell> Type </TableCell>
                <TableCell> Size </TableCell>
                <TableCell> Actions </TableCell>
            </TableHead>
        )

    }

    renderTableRow(item, index, { to, selected }) {
        return (
            <TableRow key={item._id || index} theme={tableTheme} selected={selected}>
                <RRTableCell className={tableTheme.link} to={to} theme={tableTheme}>
                    <Img className={tableTheme.img} src={item._meta.img} alt={item._name} />
                </RRTableCell>
                <RRTableCell className={tableTheme.link} to={to}> {item._name} </RRTableCell>
                <TableCell> {item._type} </TableCell>
                <TableCell> {item._size} </TableCell>
                <TableCell>

                    <TooltipRRButton
                        to={to} label='view'
                        raised primary
                        tooltip='View'
                        tooltipDelay={1000}
                        tooltipPosition='top'
                    />
                    {this.renderActions(item)}

                </TableCell>
            </TableRow>
        )
    }

    renderActions(item) {
        return (
            <span>
                {this.props.archive ?
                    <TooltipIconButton
                        icon='archive'
                        label='archive'
                        tooltip='Archive'
                        tooltipDelay={1000}
                        tooltipPosition='top'
                    /> : null}
                {this.props.delete ?
                    <TooltipIconButton
                        icon='delete'
                        label='delete'
                        accent
                        tooltip='Delete'
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.deleteItem.bind(this, item),
                            null,
                            {
                                confirmLabel: 'Yes',
                                cancelLabel: 'No',
                                title: 'Delete Item - ' + item._name,
                                text: 'Are you sure?'
                            })}
                    /> : null}
                {this.props.removeFromItem ?
                    <TooltipIconButton
                        icon='remove_circle_outline'
                        label={'Remove to ' + this.props.parentItem._name}
                        accent
                        tooltip={'Remove to ' + this.props.parentItem._name}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.removeItemFromItem.bind(this, { item: this.props.parentItem, toRemove: item }),
                            null,
                            {
                                confirmLabel: 'Yes',
                                cancelLabel: 'No',
                                title: 'Remove Item - ' + item._name + ' from ' + this.props.parentItem._name,
                                text: 'Are you sure?'
                            })}
                    /> : null}

                {this.props.addToItem ?
                    <TooltipIconButton
                        icon='add_circle_outline'
                        label={'Add to ' + this.props.parentItem._name}
                        accent
                        tooltip={'Add to ' + this.props.parentItem._name}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        onClick={this.props.actions.addItemToItem.bind(this, { item: this.props.parentItem, toAdd: item })}
                    /> : null}
            </span>
        )
    }

    filterItems({ items, search, sortProperty, sortOrder, page, pageSize }) {
        // TODO: optimize filter
        // TODO: maybe filter deleted before this?
        let filtered = (items || [])
            .filter((i) => {
                let isItem = (!!i && !!i._meta && !i._meta.deleted)
                if (!isItem) return isItem
                let hasSearch = !!search
                if (!hasSearch) return isItem
                let regex = new RegExp(search, 'i')
                let match = regex.exec((i._name || '') +
                    (i._meta.fullName || '') +
                    (i._meta.description || ''))
                return !!match
            })
            .sort((a, b) => {
                let propA = a[sortProperty] || a._meta[sortProperty]
                let propB = b[sortProperty] || b._meta[sortProperty]

                return (propA < propB ? -1 : (propA > propB ? 1 : 0)) * sortOrder
            })

        let filteredLength = filtered.length

        let maxPages = Math.ceil(filteredLength / pageSize)

        let paged = filtered.slice(
            page * pageSize,
            (page * pageSize) + pageSize
        )

        return {
            items: paged,
            page: page,
            pages: maxPages,
            itemsLength: filteredLength,
            pageSize: pageSize
        }
    }

    renderRows = (items) =>
        <Rows
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={this.renderTableHead.bind(this)}
        />

    renderCards = (items) =>
        <List
            itemRenderer={this.props.itemRenderer || this.renderCard}
            list={items}
            isError={this.state.isError}
            isLoading={this.state.isLoading}
            side={this.props.side}
        />

    render() {
        let data = this.filterItems({
            items: this.props.items,
            search: this.state.search,
            sortProperty: this.state.sortProperty,
            sortOrder: this.state.sortOrder,
            page: this.state.page,
            pageSize: this.state.pageSize
        })

        let items = data.items
        let renderItems

        if (this.props.listMode === 'rows') {
            renderItems = this.renderRows
        } else if (this.props.listMode === 'cards') {
            renderItems = this.renderCards
        } else if (!!this.props.rowsView) {
            renderItems = this.renderRows
        } else {
            renderItems = this.renderCards
        }

        return (

            <div >
                <Grid fluid >
                    <Row middle='md' className={theme.itemsListControls}>
                        <Col lg={3}>
                            <Input type='text' label='Search' icon='search' name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} />
                        </Col>
                        <Col md={2}>
                            <Dropdown
                                auto
                                icon='sort'
                                label='Sort by'
                                onChange={this.handleChange.bind(this, 'sortProperty')}
                                source={SORT_PROPERTIES}
                                value={this.state.sortProperty}
                            />
                        </Col>
                        <Col lg={1}>
                            <div>
                                <IconButton icon='arrow_upward' accent={this.state.sortOrder === 1} onClick={this.handleChange.bind(this, 'sortOrder', 1)} />
                                <IconButton icon='arrow_downward' accent={this.state.sortOrder === -1} onClick={this.handleChange.bind(this, 'sortOrder', -1)} />
                            </div>
                        </Col>
                        <Col lg={5}>
                            <Pagination
                                page={data.page}
                                pages={data.pages}
                                pageSize={this.state.pageSize}
                                itemsLength={data.itemsLength}
                                goToPage={this.goToPage.bind(this)}
                                goToLastPage={this.goToPage.bind(this, data.pages - 1)}
                                goToNextPage={this.goToPage.bind(this, data.page + 1)}
                                goToFirstPage={this.goToPage.bind(this, 0)}
                                goToPrevPage={this.goToPage.bind(this, data.page - 1)}
                                changePageSize={this.changePageSize.bind(this, 'pageSize',
                                    { page: data.page, pages: data.pages, itemsLength: data.itemsLength })}
                            />
                        </Col>
                        {!this.props.listMode ?
                            <Col lg={1}>
                                <div>
                                    <IconButton icon='view_module' accent={!this.props.rowsView} onClick={this.toggleView.bind(this, false)} />
                                    <IconButton icon='view_list' accent={this.props.rowsView} onClick={this.toggleView.bind(this, true)} />
                                </div>
                            </Col>
                            :
                            null
                        }
                    </Row>
                </Grid>
                <Grid fluid>

                    {renderItems(items)}

                </Grid>
            </div >
        )
    }
}


ItemsList.propTypes = {
    actions: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    rowsView: PropTypes.bool.isRequired,
    itemRenderer: PropTypes.func,
    side: PropTypes.string.isRequired,
    listMode: PropTypes.string
}

function mapStateToProps(state, props) {
    return {
        rowsView: !!state.ui[props.viewModeId],
        side: state.nav.side
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
)(ItemsList);
