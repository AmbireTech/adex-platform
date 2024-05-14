import React, { useEffect, useState, useCallback } from 'react'
import { Tooltip, IconButton, Box } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import { utils } from 'ethers'
import { sliderFilterOptions } from './commonFilters'
import Media from 'components/common/media'
import { ArchiveItemBtn } from 'components/dashboard/containers/ItemCommon'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import {
	t,
	selectAdUnitsTableData,
	selectAdUnitsStatsMaxValues,
	selectInitialDataLoadedByData,
} from 'selectors'
import { useSelector } from 'react-redux'
import { formatDateTime, truncateString } from 'helpers/formatters'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { AdUnit } from 'adex-models'
import { execute, cloneItem } from 'actions'
import { useTableData } from './tableHooks'
const RRIconButton = withReactRouterLink(IconButton)
const RRIMedia = withReactRouterLink(Media)

const getCols = ({ noActions, noClone, maxImpressions, maxClicks, maxCTR }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: false,
			customBodyRender: ({ selectOnImage, id, mediaUrl, mediaMime, to }) => {
				const ImgComponent = selectOnImage ? Media : RRIMedia
				return (
					<ImgComponent
						key={id}
						fullScreenOnClick={true}
						isCellImg
						src={mediaUrl}
						alt={id}
						mediaMime={mediaMime}
						allowVideo
						{...(!selectOnImage ? { to } : {})}
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
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			sort: true,
			customBodyRender: impressions => utils.commify(impressions || 0),
			...sliderFilterOptions({
				initial: [0, maxImpressions],
				filterTitle: t('IMPRESSIONS_FILTER'),
			}),
		},
	},
	{
		name: 'clicks',
		label: t('CHART_LABEL_CLICKS'),
		options: {
			sort: true,
			customBodyRender: clicks => utils.commify(clicks || 0),
			...sliderFilterOptions({
				initial: [0, maxClicks],
				filterTitle: t('CLICKS_FILTER'),
			}),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			sort: true,
			customBodyRender: ctr => `${Number(ctr).toFixed(2)} %`,
			...sliderFilterOptions({
				initial: [0, Number(maxCTR.toFixed(2))],
				filterTitle: t('CTR_FILTER'),
			}),
		},
	},
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
			customBodyRender: ({ to, item, id, title }) => (
				<Box key={id}>
					<Tooltip
						arrow
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
							arrow
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
					<ArchiveItemBtn
						itemType='AdUnit'
						itemId={id}
						title={title}
						isIconBtn
					/>
				</Box>
			),
		},
	},
]

const getOptions = () => ({
	filterType: 'multiselect',
	sortOrder: {
		name: 'created',
		direction: 'desc',
	},
})

function AdUnitsTable(props) {
	const {
		noActions,
		noClone,
		campaignId,
		handleSelect,
		// selected,
		items,
	} = props

	const selector = selectAdUnitsTableData

	const { maxClicks, maxImpressions, maxCTR } = useSelector(state =>
		selectAdUnitsStatsMaxValues(state, { campaignId, items })
	)
	const itemsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'allItems')
	)

	const [selectorArgs, setSelectorArgs] = useState({})
	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() =>
			getCols({
				noActions,
				noClone,
				maxImpressions,
				maxClicks,
				maxCTR,
			}),
		[maxCTR, maxClicks, maxImpressions, noActions, noClone]
	)

	const { data, columns } = useTableData({
		selector,
		selectorArgs,
		getColumns,
	})

	useEffect(() => {
		if (campaignId) {
			setSelectorArgs({ campaignId })
			return
		}

		if (items) {
			setSelectorArgs({ campaignId, items })
		}
	}, [campaignId, items])

	useEffect(() => {
		setOptions(getOptions())
	}, [])

	return (
		<MUIDataTableEnhanced
			{...props}
			title={campaignId ? t('CAMPAIGN_AD_UNITS') : t('ALL_UNITS')}
			data={data}
			columns={columns}
			options={options}
			handleRowSelectionChange={handleSelect}
			loading={!itemsLoaded}
		/>
	)
}

export default AdUnitsTable
