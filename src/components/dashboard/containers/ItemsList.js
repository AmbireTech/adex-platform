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
import { items as ItemsConstants } from 'adex-constants'
const { AdSizesByValue, AdTypesByValue, ItemTypesNames } = ItemsConstants

const RRTableCell = withReactRouterLink(TableCell)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)
const TooltipButton = Tooltip(Button)

const SORT_PROPERTIES = [
    { value: 'fullName' },
    { value: 'createdOn' },
    { value: 'size' },
    { value: 'adType' },
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
            sortProperty: (props.sortProperties || SORT_PROPERTIES)[0] ? (props.sortProperties || SORT_PROPERTIES)[0].value : null, // TODO: fix this
            filteredItems: []
        }

        this.renderCard = this.renderCard.bind(this)
    }

    mapSortProperties = (sortProps = []) => {
        return sortProps.map((prop) => {
            if (prop.label) {
                return prop
            } else {
                return {
                    value: prop.value,
                    label: this.props.t(prop.value, { isProp: true })
                }
            }
        })
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
        const t = this.props.t
        return (
            <Card
                key={item._id}
                item={item}
                name={item._meta.fullName}
                logo={item._meta.img}
                side={this.props.side}
                delete={this.props.actions.confirmAction.bind(this,
                    this.props.actions.deleteItem.bind(this, { item: item, objModel: this.props.objModel, authSig: this.props.account._authSig }),
                    null,
                    {
                        confirmLabel: t('CONFIRM_YES'),
                        cancelLabel: t('CONFIRM_NO'),
                        text: t('DELETE_ITEM', {args: [t(ItemTypesNames[item._type], {isProp: true}), item._meta.fullName]}),
                        title: t('CONFIRM_SURE')
                    })}
                remove={null}
                actionsRenderer={this.renderActions(item)}

            />
        )
    }

    renderTableHead({ selected }) {
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

    renderTableRow(item, index, { to, selected }) {
        const t = this.props.t
        return (
            <TableRow key={item._id || index} theme={tableTheme} selected={selected}>
                <RRTableCell className={tableTheme.link} to={to} theme={tableTheme}>
                    <Img className={classnames(tableTheme.img)} src={Item.getImgUrl(item._meta.img, process.env.IPFS_GATEWAY) || ''} alt={item._meta.fullName} />
                </RRTableCell>
                <RRTableCell className={tableTheme.link} to={to}> {item._meta.fullName} </RRTableCell>
                <TableCell> {(AdTypesByValue[item._meta.adType] || {}).label} </TableCell>
                <TableCell> {(AdSizesByValue[item._meta.size] || {}).label} </TableCell>
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

    renderActions(item) {
        const parentItem = this.props.parentItem
        const parentName = parentItem ? parentItem._meta.fullName : ''
        const itemName = item._meta.fullName
        const t = this.props.t
        const itemTypeName = t(ItemTypesNames[item._type], {isProp: true})

        return (
            <span>
                {this.props.archive ?
                    <TooltipIconButton
                        icon='archive'
                        label={t('ARCHIVE')}
                        tooltip={t('ARCHIVE')}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                    /> : null}
                {this.props.delete ?
                    <TooltipIconButton
                        icon='delete'
                        label={t('DELETE')}
                        tooltip={t('DELETE')}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        className={RTButtonTheme.danger}
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.deleteItem.bind(this, { item: item, objModel: this.props.objModel, authSig: this.props.account._authSig }),
                            null,
                            {
                                confirmLabel: t('CONFIRM_YES'),
                                cancelLabel: t('CONFIRM_NO'),
                                text: t('DELETE_ITEM', {args: [itemTypeName, itemName]}),
                                title: t('CONFIRM_SURE')
                            })}
                    /> : null}
                {this.props.removeFromItem && parentItem?
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
                                text: t('REMOVE_ITEM', {args: [itemTypeName, itemName, t(ItemTypesNames[parentItem._type], {isProp: true}), parentName ]}),
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

    filterItems({ items, search, sortProperty, sortOrder, page, pageSize, searchMatch }) {
        // TODO: optimize filter
        // TODO: maybe filter deleted before this?
        let filtered = (items || [])
            .filter((i) => {
                let isItem = (!!i && ((!!i._meta && !i._deleted) || i.id || i._id))
                if (!isItem) return isItem
                let hasSearch = !!search
                if (!hasSearch) return isItem
                let regex = new RegExp(search, 'i')
                let meta = i._meta || {}
                let matchString = null
                if (typeof searchMatch === 'function') {
                    matchString = searchMatch(i)
                } else if (typeof searchMatch === 'string' && !!searchMatch) {
                    matchString = searchMatch
                } else {
                    matchString = 
                        (meta.fullName || '') +
                        (meta.description || '')
                }

                let match = regex.exec(matchString)
                return !!match
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
            searchMatch: this.props.searchMatch
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

        return (
            <div>
                <div className={theme.listTools}>
                    <Grid fluid style={{ padding: 0 }} >
                        <Row middle='xs' className={theme.itemsListControls}>
                            <Col sm={6} md={6} lg={3}>
                                <Input type='text' label='Search' icon='search' name='search' value={this.state.search} onChange={this.handleChange.bind(this, 'search')} />
                            </Col>
                            <Col sm={6} md={6} lg={3}>
                                <div style={{ display: 'inline-block', width: 'calc(100% - 76px)' }}>
                                    <Dropdown
                                        auto
                                        icon='sort'
                                        label='Sort by'
                                        onChange={this.handleChange.bind(this, 'sortProperty')}
                                        source={this.mapSortProperties(this.props.sortProperties || SORT_PROPERTIES)}
                                        value={this.state.sortProperty}
                                    />
                                </div>
                                <div style={{ display: 'inline-block' }}>
                                    <IconButton icon='arrow_upward' primary={this.state.sortOrder === 1} onClick={this.handleChange.bind(this, 'sortOrder', 1)} />
                                    <IconButton icon='arrow_downward' primary={this.state.sortOrder === -1} onClick={this.handleChange.bind(this, 'sortOrder', -1)} />
                                </div>
                            </Col>
                            <Col sm={10} md={10} lg={5}>
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
                                <Col sm={2} md={2} lg={1}>
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
                <section>
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
    objModel: PropTypes.func
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        rowsView: !!persist.ui[props.viewModeId],
        side: memory.nav.side,
        account: persist.account
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
