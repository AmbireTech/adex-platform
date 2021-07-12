import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { Box, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import {
	t,
	selectInitialDataLoaded,
	selectWalletAssetsTableData,
} from 'selectors'
import { useTableData } from 'components/dashboard/containers/Tables/tableHooks'

const styles = theme => {
	return {
		row: {
			'& td': {
				borderBottom: 0,
			},
		},
		OddRow: {
			'& td': {
				backgroundColor: theme.palette.background.default,
			},
		},
	}
}

const useStyles = makeStyles(styles)

const getCols = ({ symbol }) => [
	{
		name: 'logo',
		// label: t('logo'),
		options: {
			filter: false,
			sort: false,
			customBodyRender: ({ logoSrc, name }) => (
				<Avatar src={logoSrc} alt={name} />
			),
		},
	},
	{
		name: 'name',
		label: t('PROP_ASSET'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: (name = '') => name,
		},
	},
	{
		name: 'balance',
		label: t('PROP_AMOUNT'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: balance => balance,
		},
	},
	// {
	// 	name: 'amountMainCurrency',
	// 	label: t('PROP_AMOUNT_MAIN_CURRENCY'),
	// 	options: {
	// 		filter: true,
	// 		sort: true,
	// 	},
	// },
	{
		name: 'share',
		label: t('PROP_SHARE'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: (share = '') => `${share}%`,
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: true,
			download: false,
			customBodyRender: ({ id } = {}) => <Box key={id}></Box>,
		},
	},
]

const getOptions = ({ classes }) => ({
	// filterType: 'multiselect',
	sortOrder: {
		name: 'created',
		direction: 'desc',
	},
	selectableRows: 'none',
	setRowProps: (row, _dataIndex, rowIndex) => {
		return {
			className: clsx(row, {
				[classes.OddRow]: rowIndex % 2 === 0,
			}),
			style: { border: 0 },
		}
	},
})

function WalletAssetsTable(props) {
	const classes = useStyles()
	const itemsLoaded = useSelector(selectInitialDataLoaded)

	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() =>
			getCols({
				// symbol,
			}),
		[]
	)

	const { data, columns } = useTableData({
		selector: selectWalletAssetsTableData,
		getColumns,
	})

	useEffect(() => {
		setOptions(getOptions({ classes }))
	}, [classes])

	return (
		<MUIDataTableEnhanced
			title={t('POSITIONS')}
			data={data}
			columns={columns}
			options={options}
			loading={!itemsLoaded}
			{...props}
		/>
	)
}

export default WalletAssetsTable
