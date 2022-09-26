import React, { useEffect, useState, useCallback } from 'react'
import { utils } from 'ethers'
import Media from 'components/common/media'
import { useSelector } from 'react-redux'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import {
	t,
	selectBestEarnersTableData,
	selectMainToken,
	selectInitialDataLoadedByData,
} from 'selectors'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { useTableData } from './tableHooks'
const RRMedia = withReactRouterLink(Media)

const getCols = ({ symbol }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: true,
			customBodyRender: ({ id, mediaUrl, mediaMime, to }) => {
				const ImgComponent = to ? RRMedia : Media
				const imgProps = to ? { to } : { fullScreenOnClick: true }
				return (
					<ImgComponent
						key={id}
						isCellImg
						src={mediaUrl}
						alt={id}
						mediaMime={mediaMime}
						allowVideo
						{...imgProps}
					/>
				)
			},
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
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: impressions => utils.commify(impressions || 0),
		},
	},
	{
		name: 'clicks',
		label: t('LABEL_CLICKS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: clicks => utils.commify(clicks || 0),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: ctr => `${ctr.toFixed(4)} %`,
		},
	},
	{
		name: 'earnings',
		label: t('LABEL_EARNINGS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: earnings => `${earnings.toFixed(2)} ${symbol}`,
		},
	},
]

const getOptions = () => ({
	filterType: 'multiselect',
	sortOrder: {
		name: 'ctr',
		direction: 'desc',
	},
	rowsPerPage: 5,
})

function BestEarnersTable(props) {
	const {
		noActions,
		noClone,
		handleSelect,
		selector = selectBestEarnersTableData,
		title = '',
	} = props
	const { symbol } = useSelector(selectMainToken)
	const dataLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'advancedAnalytics')
	)

	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() =>
			getCols({
				noActions,
				noClone,
				symbol,
			}),
		[noActions, noClone, symbol]
	)

	const { data, columns } = useTableData({
		selector,
		getColumns,
	})

	useEffect(() => {
		setOptions(getOptions())
	}, [])

	return (
		<MUIDataTableEnhanced
			{...props}
			title={t(title)}
			data={data}
			columns={columns}
			options={options}
			handleRowSelectionChange={handleSelect}
			loading={!dataLoaded}
			noSearch
			noDownload
			noPrint
			noViewColumns
		/>
	)
}

export default BestEarnersTable
