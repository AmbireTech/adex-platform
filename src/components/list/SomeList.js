
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../actions/itemActions'
import { ItemsTypes } from './../../constants/itemsTypes'
// import Card from './../collection/Card'
// import NewUnitForm from './../forms/NewUnitForm'
// import Rows from './../collection/Rows'
import { IconButton } from 'react-toolbox/lib/button'
import { compose } from 'recompose'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import Autocomplete from 'react-toolbox/lib/autocomplete'

const VIEW_MODE = 'unitsRowsView'

const PAGE_SIZES = [
    { value: 5, label: 5 },
    { value: 10, label: 10 },
    { value: 20, label: 20 },
    { value: 46, label: 46 },
]

class SomeList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            items: [],
            page: 0,
            pageSize: PAGE_SIZES[1].value,
            isLoading: false,
            isError: false,
            search: '',
            filteredItems: []
        }
    }

    toggleView() {
        // this.props.actions.updateUi(VIEW_MODE, !this.props.rowsView)
    }

    goToNextPage() {
        this.goToPage(this.state.page + 1)
    }

    goToPrevPage() {
        this.goToPage(this.state.page - 1)
    }

    goToPage(page) {
        this.setState({ page: parseInt(page) })
    }

    handleChange = (name, value) => {
        let newStateValue = { [name]: value }
        if (name === 'search') newStateValue.page = 0
        this.setState(newStateValue);
    }

    changePageSize = (name, { itemsLength, page, pages }, newPageSize) => {
        let currentPageSize = this.state.pageSize
        let currentFirstIndex = page * currentPageSize // To have at least the first item on current page on the next page
        let nextPage = Math.floor(currentFirstIndex / newPageSize)
        this.setState({ page: nextPage, pageSize: newPageSize })
    }

    filterItems(items) {
        // TODO: cache filter
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
        // .sort((a, b) => b._id - a._id)
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
            itemsLength: filteredLength
        }
    }

    render() {
        // TODO: optimise and make methods
        let data = this.filterItems(this.props.items)
        let items = data.items
        console.log('data.pages', data.pages)

        return (

            <div>
                <h1>All units </h1>
                <div>
                    {/* <NewUnitForm addCampaign={this.props.actions.addCampaign} btnLabel="Add new Unit" title="Add new unit" /> */}
                    <IconButton icon='view_module' primary onClick={this.toggleView} />
                    <IconButton icon='view_list' primary onClick={this.toggleView} />
                </div>

                <Input type='text' label='Search' name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} maxLength={160} />

                <Dropdown
                    auto
                    label='Page size'
                    onChange={this.changePageSize.bind(this, 'pageSize', { page: data.page, pages: data.pages, itemsLength: data.itemsLength })}
                    source={PAGE_SIZES}
                    value={this.state.pageSize}
                />

                <AdvancedList
                    itemRenderer={this.props.itemRenderer}
                    list={items}
                    isError={this.state.isError}
                    isLoading={this.state.isLoading}
                    page={data.page}
                    pages={data.pages}
                    goToPage={this.goToPage.bind(this)}
                    goToLastPage={this.goToPage.bind(this, data.pages - 1)}
                    goToNextPage={this.goToPage.bind(this, data.page + 1)}
                    goToFirstPage={this.goToPage.bind(this, 0)}
                    goToPrevPage={this.goToPage.bind(this, data.page - 1)}
                />
            </div >
        )
    }
}


const List = ({ list, itemRenderer }) => {
    return (<div className="list">
        {list.map((item, index) => itemRenderer(item, index))}
    </div>)
}

const withLoading = (conditionFn) => (Component) => (props) =>
    <div>
        <Component {...props} />

        <div className="interactions">
            {conditionFn(props) && <span>Loading...</span>}
        </div>
    </div>

const withPaginated = (conditionFn) => (Component) => (props) =>
    <div>
        <div className="interactions">
            {
                conditionFn(props) &&
                <div>
                    <div>
                        <IconButton
                            disabled={!(props.page > 0 && props.pages > props.page)}
                            icon='first_page'
                            onClick={props.goToFirstPage} />
                        <IconButton
                            disabled={!(props.page > 0 && props.pages > props.page)}
                            icon='chevron_left'
                            onClick={props.goToPrevPage} />
                        <span> {props.page + 1} </span>
                        <span> of </span>
                        <span> {props.pages} </span>
                        <IconButton
                            disabled={!(props.page < (props.pages - 1))}
                            icon='chevron_right'
                            onClick={props.goToNextPage} />
                        <IconButton
                            disabled={!(props.page < (props.pages - 1))}
                            icon='last_page'
                            onClick={props.goToLastPage} />
                    </div>
                    <Autocomplete
                        direction="down"
                        label="Go to page"
                        hint="Type or select the page you want go"
                        multiple={true}
                        onChange={props.goToPage}
                        source={getAllPagedValues(props.page, props.pages)}
                        value={[props.page + '']}
                    />
                </div>
            }
        </div>

        <Component {...props} />
    </div>

const getAllPagedValues = (current, max) => {
    let pages = {}

    for (var index = 0; index < max; index++) {
        if (index !== current) {
            pages[index + ''] = index + 1 + ''
        }
    }

    return pages
}

const paginatedCondition = props =>
    props.page !== null //&& !props.isLoading && props.isError;


const loadingCondition = props =>
    props.isLoading;

const AdvancedList = compose(
    withPaginated(paginatedCondition),
    // withLoading(loadingCondition),
)(List);

SomeList.propTypes = {
    // actions: PropTypes.object.isRequired,
    // account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    // rowsView: PropTypes.bool.isRequired,
    itemRenderer: PropTypes.func
};


function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        // account: state.account,
        // items: state.items[ItemsTypes.AdUnit.id],
        // rowsView: !!state.ui[VIEW_MODE],
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
)(SomeList);
