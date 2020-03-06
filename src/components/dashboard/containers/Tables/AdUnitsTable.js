import React, { useEffect, useState, useCallback } from 'react'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import {
	t,
	selectAdUnitsTableData,
	selectSide,
	selectCampaignById,
	selectAdUnits,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime, truncateString } from 'helpers/formatters'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { AdUnit } from 'adex-models'
import { execute, cloneItem } from 'actions'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(styles)

const getCols = ({ classes, noActions, noClone, campaignAdUnits }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: false,
			customBodyRender: ({ id, mediaUrl, mediaMime }) => {
				return (
					<Img
						fullScreenOnClick={true}
						className={classnames(classes.cellImg)}
						src={mediaUrl}
						alt={id}
						mediaMime={mediaMime}
						allowVideo
					/>
				)
			},
		},
	},
	{
		name: 'title',
		label: t('PROP_TITLE'),
		options: {
			filter: false,
			sort: true,
			// TODO: fix it with css
			customBodyRender: (title = '') => truncateString(title, 20),
		},
	},
	...getCampaignAdUnitsCols(campaignAdUnits),
	{
		name: 'type',
		label: t('PROP_TYPE'),
		options: {
			filter: true,
			sort: true,
			customBodyRender: (type = '') => type.replace('legacy_', ''),
		},
	},
	{
		name: 'created',
		label: t('PROP_CREATED'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
			customBodyRender: created => formatDateTime(created),
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			display: !noActions,
			sort: true,
			download: false,
			customBodyRender: ({ to, item }) => (
				<React.Fragment>
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton to={to} variant='contained' aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					{!noClone && (
						<Tooltip
							title={t('TOOLTIP_CLONE')}
							// placement='top'
							enterDelay={1000}
						>
							<span>
								<NewCloneUnitDialog
									onBeforeOpen={() =>
										execute(
											cloneItem({
												item,
												itemType: 'AdUnit',
												objModel: AdUnit,
											})
										)
									}
									iconButton
								/>
							</span>
						</Tooltip>
					)}
				</React.Fragment>
			),
		},
	},
]

const getCampaignAdUnitsCols = display =>
	!display
		? []
		: [
				{
					name: 'impressions',
					label: t('LABEL_IMPRESSIONS'),
					options: {
						sort: true,
						// customBodyRender: impressions => commify(impressions || 0),
						// ...sliderFilterOptions({
						// 	initial: [0, maxImpressions],
						// 	filterTitle: t('IMPRESSIONS_FILTER'),
						// }),
					},
				},
				{
					name: 'clicks',
					label: t('CHART_LABEL_CLICKS'),
					options: {
						sort: true,
						// customBodyRender: clicks => commify(clicks || 0),
						// ...sliderFilterOptions({
						// 	initial: [0, maxClicks],
						// 	filterTitle: t('CLICKS_FILTER'),
						// }),
					},
				},
				{
					name: 'ctr',
					label: t('CHART_LABEL_CTR'),
					options: {
						sort: true,
						// customBodyRender: ctr => `${(ctr || 0).toFixed(2)}%`,
						// ...sliderFilterOptions({
						// 	initial: [0, 100],
						// 	filterTitle: t('DISTRIBUTED_CTR'),
						// }),
					},
				},
		  ]

const onDownload = (buildHead, buildBody, columns, data) => {
	const mappedData = data.map(i => ({
		index: i.index,
		data: [
			i.data[0].id,
			i.data[1],
			i.data[2].replace('legacy_', ''),
			formatDateTime(i.data[3]),
		],
	}))
	return `${buildHead(columns)}${buildBody(mappedData)}`.trim()
}

const getOptions = ({ onRowsSelect, reloadData, selected }) => ({
	filterType: 'multiselect',
	rowsSelected: selected,
	customToolbar: () => <ReloadData handleReload={reloadData} />,
	onDownload: (buildHead, buildBody, columns, data) =>
		onDownload(buildHead, buildBody, columns, data),
	onRowsSelect,
})

function AdUnitsTable(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const { noActions, noClone, campaignId, handleSelect, selected = [] } = props
	const campaign = useSelector(state => selectCampaignById(state, campaignId))
	const campaingAdUnits = campaign ? campaign.adUnits : false
	const allItems = useSelector(selectAdUnits)
	const items = campaingAdUnits ? campaingAdUnits : allItems
	console.log('ITEMS', items)

	const [selectorArgs, setSelectorArgs] = useState({})

	const { data, columns, reloadData } = useTableData({
		selector: selectAdUnitsTableData,
		selectorArgs,
		getColumns: () =>
			getCols({
				classes,
				noActions,
				noClone,
				campaignAdUnits: !!campaignId,
			}),
	})

	// NOTE: despite useTableData hook the component is updating.
	// 'selectorArgs' are object and they have new reference on each update
	// that causes useTableData to update the data on selectorArgs change.
	// If selectorArgs are reference type we need to use useState fot them
	// TODO: find why useTableData causing this update
	useEffect(() => {
		setSelectorArgs({ side, items, campaignId })
	}, [side, items, campaignId])

	const onRowsSelect = useCallback(
		(_, allRowsSelected) => {
			const selectedIndexes = allRowsSelected.map(row => row.dataIndex)
			const selectedItemsIds = selectedIndexes.map(i => data[i].id)

			handleSelect && handleSelect({ selectedIndexes, selectedItemsIds })
		},
		[data, handleSelect]
	)

	const options = getOptions({ onRowsSelect, selected, reloadData })
	return (
		<MUIDataTableEnhanced
			title={campaignId ? t('CAMPAIGN_AD_UNITS') : t('ALL_UNITS')}
			data={data}
			columns={columns}
			options={options}
			{...props}
		/>
	)
}

export default AdUnitsTable
