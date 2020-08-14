import React from 'react'
import { commify } from 'ethers'
import PropTypes from 'prop-types'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { Box } from '@material-ui/core'
import { t, selectMainToken } from 'selectors'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import { useSelector } from 'react-redux'

const getCols = ({ showEarnings, symbol }) => [
	{
		name: 'countryName',
		label: t('PROP_COUNTRY'),
		options: {
			filter: true,
			sort: false,
			download: true,
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
			customBodyRender: impressions => commify(impressions || 0),
		},
	},
	{
		name: 'percentImpressions',
		label: t('LABEL_PERC'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: percentImpressions =>
				`${percentImpressions.toFixed(2)} %`,
		},
	},
	{
		name: 'clicks',
		label: t('LABEL_CLICKS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: impressions => commify(impressions || 0),
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
	...(showEarnings
		? [
				{
					name: 'averageCPM',
					label: t('LABEL_AVERAGE_CPM'),
					options: {
						filter: false,
						sort: true,
						customBodyRender: averageCPM =>
							`${commify(averageCPM.toFixed(2))} ${symbol}`,
					},
				},
				{
					name: 'earnings',
					label: t('LABEL_EARNINGS'),
					options: {
						filter: false,
						sort: true,
						customBodyRender: earnings =>
							`${commify(earnings.toFixed(2))} ${symbol}`,
					},
				},
		  ]
		: []),
]

const getOptions = ({ reloadData, selected }) => ({
	filterType: 'multiselect',
	rowsSelected: selected,
	rowsPerPage: 10,
	customToolbar: () => <ReloadData handleReload={reloadData} />,
})

function StatsByCountryTable(props) {
	const { selector, selected = [], showEarnings } = props
	const { symbol } = useSelector(selectMainToken)

	const { data, columns, reloadData } = useTableData({
		selector,
		getColumns: () =>
			getCols({
				symbol,
				showEarnings,
			}),
	})

	const options = getOptions({ selected, reloadData })
	return (
		<Box>
			<MUIDataTableEnhanced
				data={data}
				columns={columns}
				options={options}
				noSearch
				noPrint
				noViewColumns
				{...props}
			/>
		</Box>
	)
}

StatsByCountryTable.propTypes = {
	selector: PropTypes.func.isRequired,
	showEarnings: PropTypes.bool,
}

export default StatsByCountryTable
