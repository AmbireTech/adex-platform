import React, { useCallback } from 'react'
import classnames from 'classnames'
import { commify } from 'ethers/utils'
import Img from 'components/common/img/Img'
import { useSelector } from 'react-redux'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import {
	t,
	selectBestEarnersTableData,
	selectMainToken,
	selectInitialDataLoadedByData,
} from 'selectors'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
const RRImg = withReactRouterLink(Img)

const useStyles = makeStyles(styles)

const getCols = ({ classes, symbol }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: true,
			customBodyRender: ({ id, mediaUrl, mediaMime, to }) => {
				const ImgComponent = to ? RRImg : Img
				const imgProps = to ? { to } : { fullScreenOnClick: true }
				return (
					<ImgComponent
						key={id}
						className={classnames(classes.cellImg)}
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
			customBodyRender: impressions => commify(impressions || 0),
		},
	},
	{
		name: 'clicks',
		label: t('LABEL_CLICKS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: clicks => commify(clicks || 0),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
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

const onDownload = (buildHead, buildBody, columns, data) => {
	const mappedData = data.map(i => ({
		index: i.index,
		data: [i.data[0].id, i.data[1].replace('legacy_', ''), i.data[2]],
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
	rowsPerPage: 5,
})

function BestEarnersTable(props) {
	const {
		noActions,
		noClone,
		handleSelect,
		selected = [],
		selector = selectBestEarnersTableData,
		title = '',
	} = props
	const classes = useStyles()
	const { symbol } = useSelector(selectMainToken)
	const dataLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'advancedAnalytics')
	)

	const { data, columns, reloadData } = useTableData({
		selector,
		getColumns: () =>
			getCols({
				classes,
				noActions,
				noClone,
				symbol,
			}),
	})

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
			title={t(title)}
			data={data}
			columns={columns}
			options={options}
			loading={!dataLoaded}
			noSearch
			noDownload
			noPrint
			noViewColumns
		/>
	)
}

export default BestEarnersTable
