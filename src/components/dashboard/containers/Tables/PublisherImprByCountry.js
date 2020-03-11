import React, { useEffect, useState, useCallback, Fragment } from 'react'
import { commify } from 'ethers/utils'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import {
	t,
	selectSide,
	selectPublisherStatsByCountryTableData,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'

const useStyles = makeStyles(styles)

const getCols = ({ classes }) => [
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
]

const getOptions = ({ reloadData, selected }) => ({
	filterType: 'multiselect',
	rowsSelected: selected,
	customToolbar: () => <ReloadData handleReload={reloadData} />,
})

function PublisherImprByCountry(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const { noActions, noClone, campaignId, selected = [] } = props

	const [selectorArgs, setSelectorArgs] = useState({})

	const { data, columns, reloadData } = useTableData({
		selector: selectPublisherStatsByCountryTableData,
		selectorArgs,
		getColumns: () =>
			getCols({
				classes,
				noActions,
				noClone,
			}),
	})

	// NOTE: despite useTableData hook the component is updating.
	// 'selectorArgs' are object and they have new reference on each update
	// that causes useTableData to update the data on selectorArgs change.
	// If selectorArgs are reference type we need to use useState fot them
	// TODO: find why useTableData causing this update
	useEffect(() => {
		setSelectorArgs({ side, campaignId })
	}, [side, campaignId])

	const options = getOptions({ selected, reloadData })
	return (
		<MUIDataTableEnhanced
			title={t('TABLE_COUNTRY_STATS_THIS_MONTH')}
			data={data}
			columns={columns}
			options={options}
			noSearch
			noPrint
			noViewColumns
			{...props}
		/>
	)
}

export default PublisherImprByCountry
