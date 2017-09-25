
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes } from './../../../constants/itemsTypes'
// import Card from './../collection/Card'
// import NewUnitForm from './../forms/NewUnitForm'
// import Rows from './../collection/Rows'
import { IconButton, Button } from 'react-toolbox/lib/button'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import { Pagination, PAGE_SIZES } from './ListControls'
import Rows from './../collection/Rows'
import Card from './../collection/Card'
import { Grid, Row, Col } from 'react-flexbox-grid'

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

    renderCard(unt, index) {
        return (
            <Card
                key={unt._id}
                item={unt}
                name={unt._name}
                logo={unt._meta.img}
                side={this.props.side}
                delete={this.props.actions.confirmAction.bind(this,
                    this.props.actions.deleteItem.bind(this, unt),
                    null,
                    {
                        confirmLabel: 'Yes',
                        cancelLabel: 'No',
                        title: 'Delete Item - ' + unt._name,
                        text: 'Are you sure?'
                    })}
            />
        )
    }

    filterItems(items) {
        // TODO: optimize filter
        let filtered = (items || [])
            .filter((i) => {
                let isItem = (!!i && !!i._meta && !i._meta.deleted)
                if (!isItem) return isItem
                let hasSearch = !!this.state.search
                if (!hasSearch) return isItem
                let regex = new RegExp(this.state.search, 'i')
                let match = regex.exec((i._name || '') +
                    (i._meta.fullName || '') +
                    (i._meta.description || ''))
                return !!match
            })
            .sort((a, b) => {
                let sortProperty = this.state.sortProperty

                let propA = a[sortProperty] || a._meta[sortProperty]
                let propB = b[sortProperty] || b._meta[sortProperty]

                return (propA < propB ? -1 : (propA > propB ? 1 : 0)) * this.state.sortOrder
            })
        let filteredLength = filtered.length

        let page = this.state.page
        let pageSize = this.state.pageSize
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

    render() {
        let data = this.filterItems(this.props.items)
        let items = data.items

        return (

            <div>
                <Grid fluid>
                    <Row middle='md'>
                        <Col md={3}>
                            <Input type='text' label='Search' icon='search' name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} maxLength={160} />
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
                        <Col md={1}>
                            <div>
                                <IconButton icon='arrow_upward' accent={this.state.sortOrder === 1} onClick={this.handleChange.bind(this, 'sortOrder', 1)} />
                                <IconButton icon='arrow_downward' accent={this.state.sortOrder === -1} onClick={this.handleChange.bind(this, 'sortOrder', -1)} />
                            </div>
                        </Col>



                        <Col md={5}>
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
                        <Col md={1}>
                            <div>
                                <IconButton icon='view_module' accent={!this.props.rowsView} onClick={this.toggleView.bind(this, false)} />
                                <IconButton icon='view_list' accent={this.props.rowsView} onClick={this.toggleView.bind(this, true)} />
                            </div>
                        </Col>
                    </Row>
                </Grid>

                {!!this.props.rowsView ?
                    <Rows
                        side={this.props.side}
                        item={items}
                        rows={items}
                        delete={this.props.actions.deleteItem} />
                    :
                    <List
                        itemRenderer={this.props.itemRenderer || this.renderCard}
                        list={items}
                        isError={this.state.isError}
                        isLoading={this.state.isLoading}
                        side={this.props.side}

                    />
                }
            </div >
        )
    }
}


ItemsList.propTypes = {
    actions: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    rowsView: PropTypes.bool.isRequired,
    itemRenderer: PropTypes.func,
    side: PropTypes.string.isRequired
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
