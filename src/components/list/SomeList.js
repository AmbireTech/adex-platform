
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../actions/itemActions'
import { ItemsTypes } from './../../constants/itemsTypes'
// import Card from './../collection/Card'
// import NewUnitForm from './../forms/NewUnitForm'
// import Rows from './../collection/Rows'
import { IconButton, Button } from 'react-toolbox/lib/button'
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

const List = ({ list, itemRenderer }) => {
    return (<div className="list">
        {list.map((item, index) => itemRenderer(item, index))}
    </div>)
}

// const Table = (props) = {

// }

const Actions = (props) => {

    return (
        <div style={{ display: 'inline-block' }}>

            <IconButton
                disabled={!(props.page > 0 && props.pages > props.page)}
                icon='chevron_left'
                onClick={props.goToPrevPage} />

            <div style={{ display: 'inline-block', width: 70 }}>
                <Autocomplete
                    allowCreate={false}
                    direction="down"
                    label='page'
                    multiple={false}
                    onChange={props.goToPage}
                    source={getAllPagedValues(props.page, props.pages)}
                    hint={props.page + 1 + ''}
                    value={props.page + ''}
                    suggestionMatch='anywhere'
                    showSuggestionsWhenValueIsSet={true}
                />
            </div>

            <IconButton
                disabled={!(props.page < (props.pages - 1))}
                icon='chevron_right'
                onClick={props.goToNextPage} />

            <span> of </span>
            <span> {props.pages} </span>
        </div >)

}

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
        console.log('page', page)
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
                <div>
                    {/* <NewUnitForm addCampaign={this.props.actions.addCampaign} btnLabel="Add new Unit" title="Add new unit" /> */}
                    <IconButton icon='view_module' primary onClick={this.toggleView} />
                    <IconButton icon='view_list' primary onClick={this.toggleView} />
                </div>

                <Input type='text' label='Search' icon='search' name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} maxLength={160} />


                <Actions
                    page={data.page}
                    pages={data.pages}
                    itemsLength={data.itemsLength}
                    changePageSize={this.changePageSize}
                    goToPage={this.goToPage.bind(this)}
                    goToLastPage={this.goToPage.bind(this, data.pages - 1)}
                    goToNextPage={this.goToPage.bind(this, data.page + 1)}
                    goToFirstPage={this.goToPage.bind(this, 0)}
                    goToPrevPage={this.goToPage.bind(this, data.page - 1)} />

                <span>  / Page size: </span>
                {
                    PAGE_SIZES.map((page) =>
                        <Button
                            floating
                            mini
                            label={page.value}
                            onClick={this.changePageSize.bind(this, 'pageSize',
                                { page: data.page, pages: data.pages, itemsLength: data.itemsLength }, page.value)}
                            accent={page.value === this.state.pageSize}

                        />)
                }

                <List
                    itemRenderer={this.props.itemRenderer}
                    list={items}
                    isError={this.state.isError}
                    isLoading={this.state.isLoading}

                />
            </div >
        )
    }

}


const getAllPagedValues = (current, max) => {
    let pages = {}

    for (var index = 0; index < max; index++) {
        pages[index + ''] = index + 1 + ''
    }

    return pages
}


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
