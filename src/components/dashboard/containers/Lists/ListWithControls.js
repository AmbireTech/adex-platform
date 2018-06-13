import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { IconButton } from 'react-toolbox/lib/button'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import { Pagination, InputLabel } from './Controls'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './../theme.css'
import Translate from 'components/translate/Translate'
// import classnames from 'classnames'
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio'

const mapFilterProps = ({ filterProps = {}, t }) => {
    return Object.keys(filterProps)
        .map((key) => {
            let prop = filterProps[key]
            let label = prop.label || key
            return {
                label: t(label, { isProp: prop.labelIsProp || !prop.label, args: prop.labelArgs || [] }),
                value: key
            }
        })
}

const mapSortProperties = ({ sortProps = [], t }) => {
    return sortProps.map((prop) => {
        let label = prop.label || prop.value

        return {
            value: ((prop.value !== null && prop.value !== undefined) ? prop.value : '').toString(),
            label: t(label, { isProp: !prop.label, args: prop.labelArgs || [] })
        }
    })
}

class ListWithControls extends Component {
    constructor(props, context) {
        super(props, context);

        const sortProperties = mapSortProperties({ sortProps: props.sortProperties || [{}], t: props.t })
        // TODO: update on ComponentWillReceiveProps

        this.state = {
            items: [],
            page: 0,
            pageSize: 10,
            search: '',
            sortOrder: -1,
            sortProperties: sortProperties,
            sortProperty: (sortProperties)[0].value,
            filterProperties: mapFilterProps({ filterProps: props.filterProperties, t: props.t }),
            filteredItems: [],
            filterBy: null,
            filterByValues: [],
            filterByValueFilter: null,
            filterArchived: props.archive ? false : ''
        }
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
        if (name === 'filterBy') {
            newStateValue.filterByValues = ([{ label: 'ALL', value: '' }].concat(this.props.filterProperties[value].values))
            newStateValue.filterByValueFilter = ''
        }
        this.setState(newStateValue);
    }

    changePageSize = (name, { itemsLength, page, pages } = {}, newPageSize) => {
        let currentPageSize = this.state.pageSize
        let currentFirstIndex = page * currentPageSize // To have at least the first item on current page on the next page
        let nextPage = Math.floor(currentFirstIndex / newPageSize)
        this.setState({ page: nextPage, pageSize: newPageSize })
    }

    search = ({ item, search, searchMatch }) => {
        let regex = new RegExp(search, 'i')
        let meta = item._meta || {}
        let matchString = null
        if (typeof searchMatch === 'function') {
            matchString = searchMatch(item)
        } else if (typeof searchMatch === 'string' && !!searchMatch) {
            matchString = searchMatch
        } else {
            matchString =
                (meta.fullName || '') +
                (meta.description || '')
        }

        let match = regex.exec(matchString)
        return !!match
    }

    filterItems = ({ items, search, sortProperty, sortOrder, page, pageSize, searchMatch, filterBy, filterArchived }) => {
        // TODO: optimize filter
        // TODO: maybe filter deleted before this?
        let filtered = (items || [])
            .filter((i) => {
                let isItem = (!!i && ((!!i._meta) || i.id || i._id))
                if (!isItem) return isItem

                if ((filterArchived !== '') && (filterArchived.toString() !== i._archived.toString())) {
                    return false
                }

                if (filterBy && filterBy.key && (filterBy.value)) {
                    let itemValue = filterBy.key.split('.')
                        .reduce((o, p) => o ? o[p] : 'noprop', i) || ''

                    let passFilter = itemValue.toString() === filterBy.value.toString()

                    if (!passFilter) {
                        return false
                    }
                }

                let hasSearch = !!search
                if (!hasSearch) return isItem

                return this.search({ item: i, search, searchMatch })
            })

        if (sortProperty) {
            filtered = filtered.sort((a, b) => {
                let propA = a[sortProperty] || (a._meta ? a._meta[sortProperty] : 0)
                let propB = b[sortProperty] || (b._meta ? b._meta[sortProperty] : 0)

                return (propA < propB ? -1 : (propA > propB ? 1 : 0)) * sortOrder
            })
        }

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

    render() {
        let data = this.filterItems({
            items: this.props.items,
            search: this.state.search,
            sortProperty: this.state.sortProperty,
            sortOrder: this.state.sortOrder,
            page: this.state.page,
            pageSize: this.state.pageSize,
            searchMatch: this.props.searchMatch,
            filterBy: { key: this.state.filterBy, value: this.state.filterByValueFilter },
            filterArchived: this.state.filterArchived
        })

        let items = data.items
        let renderItems

        if ((this.props.listMode === 'rows') || !!this.props.rowsView) {
            renderItems = this.props.renderRows
        } else {
            renderItems = this.props.renderCards
        }

        const { t, side } = this.props

        return (
            <div>
                <div className={theme.listTools}>
                    <Grid fluid style={{ padding: 0 }} >
                        <Row middle='xs' className={theme.itemsListControls}>
                            <Col xs={12} sm={6} md={6} lg={4}>
                                <Input theme={theme} className={theme.inputIconLabel} type='text' label={<InputLabel icon='search' label={t('LIST_CONTROL_LABEL_SEARCH')} />} name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} />
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={3}>
                                <div style={{ display: 'inline-block', width: 'calc(100% - 76px)' }}>
                                    <Dropdown
                                        auto
                                        // label={<InputLabel icon='sort' label='Sort by' style={{marginLeft: '-2px'}}/>}
                                        // icon='sort'
                                        label={t('LIST_CONTROL_LABEL_SORT')}
                                        onChange={this.handleChange.bind(this, 'sortProperty')}
                                        source={this.state.sortProperties}
                                        value={this.state.sortProperty}
                                    />
                                </div>
                                <div style={{ display: 'inline-block' }}>
                                    <IconButton icon='arrow_upward' primary={this.state.sortOrder === 1} onClick={this.handleChange.bind(this, 'sortOrder', 1)} />
                                    <IconButton icon='arrow_downward' primary={this.state.sortOrder === -1} onClick={this.handleChange.bind(this, 'sortOrder', -1)} />
                                </div>
                            </Col>
                            {this.props.filterProperties ?
                                <Col sm={12} md={12} lg={5}>
                                    <Row>
                                        <Col xs={12} sm={6} md={6} lg={6}>
                                            <Dropdown
                                                auto
                                                label={t('LIST_CONTROL_LABEL_FILTER_BY')}
                                                onChange={this.handleChange.bind(this, 'filterBy')}
                                                source={this.state.filterProperties}
                                                value={this.state.filterBy !== null ? this.state.filterBy.toString() : null}
                                            />
                                        </Col>
                                        <Col xs={12} sm={6} md={6} lg={6}>
                                            <Dropdown
                                                auto
                                                label={t('LIST_CONTROL_LABEL_FILTER_BY_VALUE')}
                                                onChange={this.handleChange.bind(this, 'filterByValueFilter')}
                                                source={mapSortProperties({ sortProps: this.state.filterByValues, t: this.props.t })}
                                                value={this.state.filterByValueFilter !== null ? this.state.filterByValueFilter.toString() : null}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                                : null}
                            {this.props.archive ?
                                <Col sm={12} md={5} lg={4}>
                                    <RadioGroup theme={theme} name='archived' value={this.state.filterArchived.toString()} onChange={this.handleChange.bind(this, 'filterArchived')}>
                                        <RadioButton theme={theme} label={t('LABEL_ACTIVE')} value={'false'} />
                                        <RadioButton theme={theme} label={t('LABEL_ARCHIVED')} value={'true'} />
                                        <RadioButton theme={theme} label={t('LABEL_ALL')} value={''} />
                                    </RadioGroup>
                                </Col>
                                : null}
                            <Col xs={12} sm={12} md={5} lg={6}>
                                <Pagination
                                    t={t}
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
                                        { page: data.page, pages: data.pages, itemsLength: data.itemsLength })
                                    }
                                />
                            </Col>
                            {!this.props.listMode ?
                                <Col sm={12} md={2} lg={2}>
                                    <div>
                                        <IconButton icon='view_module' primary={!this.props.rowsView} onClick={this.toggleView.bind(this, false)} />
                                        <IconButton icon='view_list' primary={this.props.rowsView} onClick={this.toggleView.bind(this, true)} />
                                    </div>
                                </Col>
                                :
                                null
                            }
                        </Row>

                    </Grid>
                </div >
                <section style={{ overflowY: 'auto' }}>
                    {renderItems(items)}
                </section>
            </div >
        )
    }
}

ListWithControls.propTypes = {
    actions: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    rowsView: PropTypes.bool.isRequired,
    itemRenderer: PropTypes.func,
    side: PropTypes.string.isRequired,
    listMode: PropTypes.string,
    objModel: PropTypes.func,
    sortProperties: PropTypes.array.isRequired,
    filterProperties: PropTypes.object
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        rowsView: !!persist.ui[props.viewModeId],
        side: memory.nav.side,
        account: persist.account,
        sortProperties: props.sortProperties || [],
        filterProperties: props.filterProperties
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
)(Translate(ListWithControls));
