import React, { useCallback } from 'react'
import classnames from 'classnames'
import { commify } from 'ethers/utils'
import Img from 'components/common/img/Img'
import { useSelector } from 'react-redux'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { t, selectBestEarnersTableData, selectMainToken } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'

import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'

const useStyles = makeStyles(styles)

const getCols = ({ classes, symbol }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: true,
			customBodyRender: ({ id, mediaUrl, mediaMime }) => {
				return (
					<Img
						key={id}
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
	rowsPerPage: 10,
})

function BestEarnersTable(props) {
	const { noActions, noClone, handleSelect, selected = [] } = props
	const classes = useStyles()
	const { symbol } = useSelector(selectMainToken)

	const { data, columns, reloadData } = useTableData({
		selector: selectBestEarnersTableData,
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
			title={t('TABLE_BEST_EARNERS_TITLE')}
			data={data}
			columns={columns}
			options={options}
			noSearch
			noDownload
			noPrint
			noViewColumns
			{...props}
		/>
	)
}

export default BestEarnersTable
