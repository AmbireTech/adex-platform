
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

    onPaginatedSearch(e) {
        console.log('e-hoi', e)
        this.setState({ page: this.state.page + 1 })
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
        this.setState({ page: page })
    }

    handleChange = (name, value) => {
        this.setState({ [name]: value });
    }

    filterItems(items) {
        console.log('filterItems', items)
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
            .sort((a, b) => b._id - a._id)
            .slice(this.state.page * this.state.pageSize, (this.state.page * this.state.pageSize) + this.state.pageSize)

        return filtered
    }

    render() {
        // TODO: optimise and make methods
        let items = this.filterItems(this.props.items)

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
                    onChange={this.handleChange.bind(this, 'pageSize')}
                    source={PAGE_SIZES}
                    value={this.state.pageSize}
                />

                <AdvancedList
                    itemRenderer={this.props.itemRenderer}
                    list={items}
                    isError={this.state.isError}
                    isLoading={this.state.isLoading}
                    page={this.state.page}
                    onPaginatedSearch={this.onPaginatedSearch.bind(this)}
                />
            </div>
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
                    {/* <div>
                        Something went wrong...
                     </div> */}
                    <button
                        type="button"
                        onClick={props.onPaginatedSearch}
                    >
                        Try Again
                    </button>
                </div>
            }
        </div>

        <Component {...props} />
    </div>

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
