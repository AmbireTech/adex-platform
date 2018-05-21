import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
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
import RTButtonTheme from 'styles/RTButton.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Tooltip from 'react-toolbox/lib/tooltip'
import Img from 'components/common/img/Img'
import { Item } from 'adex-models'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'
import { RadioGroup, RadioButton } from 'react-toolbox/lib/radio'
import { InputLabel } from 'components/dashboard/containers/ListControls'
import { items as ItemsConstants } from 'adex-constants'
const { AdSizesByValue, AdTypesByValue, ItemTypesNames } = ItemsConstants

const RRTableCell = withReactRouterLink(TableCell)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)
const TooltipButton = Tooltip(Button)

const List = ({ list, itemRenderer }) => {
    return (<div className="list">
        {list.map((item, index) => itemRenderer(item, index))}
    </div>)
}

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

class ItemsList extends Component {
    constructor(props, context) {
        super(props, context);

        const sortProperties = mapSortProperties({ sortProps: props.sortProperties || [{}], t: props.t })
        // TODO: update on ComponentWillReceiveProps

        this.state = {
            items: [],
            page: 0,
            pageSize: 10,
            isLoading: false,
            isError: false,
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

    renderCard = (item, index) => {
        const t = this.props.t
        return (
            <Card
                key={item._id}
                item={item}
                name={item._meta.fullName}
                logo={item._meta.img}
                side={this.props.side}
                remove={null}
                actionsRenderer={this.renderActions(item)}
            />
        )
    }

    renderTableHead = ({ selected }) => {
        const t = this.props.t
        return (
            <TableHead>
                <TableCell>
                    {selected.length ?
                        <TooltipButton
                            icon='delete'
                            label={t('DELETE_ALL')}
                            tooltip={t('DELETE_ALL')}
                            tooltipDelay={1000}
                            tooltipPosition='top'
                            className={RTButtonTheme.danger}
                            onClick={null}
                        />
                        :
                        null
                    }
                </TableCell>
                <TableCell> {t('PROP_NAME')} </TableCell>
                <TableCell> {t('PROP_ADTYPE')} </TableCell>
                <TableCell> {t('PROP_SIZE')}</TableCell>
                <TableCell> {t('PROP_CREATEDON')} </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow = (item, index, { to, selected }) => {
        const t = this.props.t
        const adSize = (AdSizesByValue[item._meta.size] || {})
        return (
            <TableRow key={item._id || index} theme={tableTheme} selected={selected}>
                <RRTableCell className={tableTheme.link} to={to} theme={tableTheme}>
                    <Img className={classnames(tableTheme.img)} src={Item.getImgUrl(item._meta.img, process.env.IPFS_GATEWAY) || ''} alt={item._meta.fullName} />
                </RRTableCell>
                <RRTableCell className={tableTheme.link} to={to}> {item._meta.fullName} </RRTableCell>
                <TableCell> {(AdTypesByValue[item._meta.adType] || {}).label} </TableCell>
                <TableCell> {t(adSize.label, { args: adSize.labelArgs || [] })} </TableCell>
                <TableCell> {moment(item._meta.createdOn).format('DD-MM-YYYY')} </TableCell>
                <TableCell>

                    <TooltipRRButton
                        to={to}
                        label={t('LABEL_VIEW')}
                        tooltip={t('LABEL_VIEW')}
                        raised
                        primary
                        tooltipDelay={1000}
                        tooltipPosition='top'
                    />
                    {this.renderActions(item)}

                </TableCell>
            </TableRow>
        )
    }

    renderActions = (item) => {
        const parentItem = this.props.parentItem
        const parentName = parentItem ? parentItem._meta.fullName : ''
        const itemName = item._meta.fullName
        const t = this.props.t
        const itemTypeName = t(ItemTypesNames[item._type], { isProp: true })

        return (
            <span>
                {this.props.archive && !item._archived ?
                    <TooltipIconButton
                        icon='archive'
                        label={t('ARCHIVE')}
                        tooltip={t('TOOLTIP_ARCHIVE')}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        className={RTButtonTheme.danger}
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.archiveItem.bind(this, { item: item, authSig: this.props.account._authSig }),
                            null,
                            {
                                confirmLabel: t('CONFIRM_YES'),
                                cancelLabel: t('CONFIRM_NO'),
                                text: t('ARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
                                title: t('CONFIRM_SURE')
                            })}
                    /> : null}
                {this.props.archive && item._archived ?
                    <TooltipIconButton
                        icon='unarchive'
                        label={t('UNARCHIVE')}
                        tooltip={t('TOOLTIP_UNARCHIVE')}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        accent
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.unarchiveItem.bind(this, { item: item, authSig: this.props.account._authSig }),
                            null,
                            {
                                confirmLabel: t('CONFIRM_YES'),
                                cancelLabel: t('CONFIRM_NO'),
                                text: t('UNARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
                                title: t('CONFIRM_SURE')
                            })}
                    /> : null}
                {this.props.removeFromItem && parentItem ?
                    <TooltipIconButton
                        icon='remove_circle_outline'
                        label={t('REMOVE_FROM', { args: [parentName] })}
                        tooltip={t('REMOVE_FROM', { args: [parentName] })}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        className={RTButtonTheme.danger}
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.removeItemFromItem.bind(this, { item: item, toRemove: this.props.parentItem, authSig: this.props.account._authSig }),
                            null,
                            {
                                confirmLabel: t('CONFIRM_YES'),
                                cancelLabel: t('CONFIRM_NO'),
                                text: t('REMOVE_ITEM', { args: [itemTypeName, itemName, t(ItemTypesNames[parentItem._type], { isProp: true }), parentName] }),
                                title: t('CONFIRM_SURE')
                            })}
                    /> : null}

                {this.props.addToItem && parentItem ?
                    <TooltipIconButton
                        icon='add_circle_outline'
                        label={t('ADD_TO', { args: [parentName] })}
                        tooltip={t('ADD_TO', { args: [parentName] })}
                        accent
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        onClick={this.props.actions.addItemToItem.bind(this, { item: item, toAdd: this.props.parentItem, authSig: this.props.account._authSig })}
                    /> : null}
            </span>
        )
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

    renderRows = (items) =>
        <Rows
            side={this.props.side}
            item={items}
            rows={items}
            multiSelectable={false}
            selectable={false}
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
            pageSize: this.state.pageSize,
            searchMatch: this.props.searchMatch,
            filterBy: { key: this.state.filterBy, value: this.state.filterByValueFilter },
            filterArchived: this.state.filterArchived
        })

        let items = data.items
        let renderItems

        if (this.props.listMode === 'rows') {
            renderItems = this.props.renderRows || this.renderRows
        } else if (this.props.listMode === 'cards') {
            renderItems = this.props.renderCards || this.renderCards
        } else if (!!this.props.rowsView) {
            renderItems = this.props.renderRows || this.renderRows
        } else {
            renderItems = this.props.renderCards || this.renderCards
        }
        const t = this.props.t

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

ItemsList.propTypes = {
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
    let persist = state.persist
    let memory = state.memory
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
)(Translate(ItemsList));
