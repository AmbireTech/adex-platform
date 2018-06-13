import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import classnames from 'classnames'
import { items as ItemsConstants } from 'adex-constants'
import moment from 'moment'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from 'react-toolbox/lib/tooltip'
import { IconButton, Button } from 'react-toolbox/lib/button'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import RTButtonTheme from 'styles/RTButton.css'
import tableTheme from 'components/dashboard/collection/theme.css'
import { Item } from 'adex-models'
import Img from 'components/common/img/Img'
import Rows from 'components/dashboard/collection/Rows'
import Card from 'components/dashboard/containers/ItemCard'
import Translate from 'components/translate/Translate'

const { ItemTypesNames, AdSizesByValue, AdTypesByValue, } = ItemsConstants

const TooltipButton = Tooltip(Button)
const RRTableCell = withReactRouterLink(TableCell)
const TooltipRRButton = withReactRouterLink(Tooltip(Button))
const TooltipIconButton = Tooltip(IconButton)

const List = ({ list, itemRenderer }) => {
    return (<div style={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap' }}>
        {list.map((item, index) =>
            <div style={{ maxWidth: '100%' }}>
                {itemRenderer(item, index)}
            </div>
        )}
    </div>)
}

class ItemsList extends Component {

    renderCard = (item, index) => {
        // const t = this.props.t
        return (
            <Card
                key={item._id}
                item={item}
                name={item._meta.fullName}
                logo={item._meta.img}
                side={this.props.side}
                remove={null}
                renderActions={() => this.renderActions(item)}
            />
        )
    }

    renderTableHead = ({ selected }) => {
        const t = this.props.t
        return (
            <TableHead>
                <TableRow>
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
                </TableRow>
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
                {!item._archived &&
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
                    />}
                {item._archived &&
                    <TooltipIconButton
                        icon='unarchive'
                        label={t('UNARCHIVE')}
                        tooltip={t('TOOLTIP_UNARCHIVE')}
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        color='secondary'
                        onClick={this.props.actions.confirmAction.bind(this,
                            this.props.actions.unarchiveItem.bind(this, { item: item, authSig: this.props.account._authSig }),
                            null,
                            {
                                confirmLabel: t('CONFIRM_YES'),
                                cancelLabel: t('CONFIRM_NO'),
                                text: t('UNARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
                                title: t('CONFIRM_SURE')
                            })}
                    />}
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
                        color='secondary'
                        tooltipDelay={1000}
                        tooltipPosition='top'
                        onClick={this.props.actions.addItemToItem.bind(this, { item: item, toAdd: this.props.parentItem, authSig: this.props.account._authSig })}
                    /> : null}
            </span>
        )
    }

    renderRows = (items) =>
        <Rows
            side={this.props.side}
            item={items}
            rows={items}
            multiSelectable={false}
            selectable={false}
            rowRenderer={this.renderTableRow}
            tableHeadRenderer={this.renderTableHead}
        />

    renderCards = (items) => {
        console.log(items)

        return (<List
            itemRenderer={this.renderCard}
            list={items}
            side={this.props.side}
        />)
    }

    render() {
        return (
            <ListWithControls
                {...this.props}
                items={this.props.items}
                viewModeId={this.props.viewModeId}
                archive
                renderRows={this.renderRows}
                renderCards={this.renderCards}
            />
        )
    }
}

ItemsList.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    viewModeId: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    objModel: PropTypes.func.isRequired,
    itemsType: PropTypes.number.isRequired,
    sortProperties: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        side: memory.nav.side,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemsList))
