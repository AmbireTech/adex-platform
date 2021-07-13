import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ExpandButton, TableBodyRow } from 'mui-datatables'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { Box, Avatar, TableRow, TableCell } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { AmountWithCurrency } from 'components/common/amount'

import clsx from 'clsx'

import {
	t,
	selectInitialDataLoaded,
	selectWalletAssetsTableData,
} from 'selectors'
import { useTableData } from 'components/dashboard/containers/Tables/tableHooks'

const styles = theme => {
	return {
		OddRow: {
			'& td': {
				backgroundColor: theme.palette.background.default,
			},
		},
		logo: {
			marginRight: theme.spacing(1),
		},
	}
}

const useStyles = makeStyles(styles)

const getCols = ({ classes }) => [
	// {
	// 	name: 'logo',
	// 	// label: t('logo'),
	// 	options: {
	// 		filter: false,
	// 		sort: false,
	// 		customBodyRender: (value) => (
	// 			<Avatar src={logoSrc} alt={name} />
	// 		),
	// 	},
	// },
	{
		name: 'name',
		label: t('PROP_ASSET'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: (value = []) => {
				return (
					<Box display='flex' flexDirection='row' alignItems='center'>
						<Avatar src={value[1]} alt={value[0]} className={classes.logo} />
						{value[0]}
					</Box>
				)
			},
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
	{
		name: 'specific',
		label: t('specific'),
		options: {
			// filter: true,
			// sort: true,
			customBodyRender: x => {
				return (
					<TreeView
						defaultCollapseIcon={<ExpandMore />}
						defaultExpandIcon={<ChevronRight />}
					>
						<TreeItem
							key={x.address}
							nodeId={x.address + '-' + 1}
							label={
								<Box>
									<AmountWithCurrency
										amount={x.total}
										unit={x.symbol}
										mainFontVariant='h6'
										decimalsFontVariant='subtitle1'
									/>
									{' ('}
									<AmountWithCurrency
										amount={
											0
											// (x.assetTotalToMainCurrenciesValues || {})[
											// 	mainCurrency.id
											// ]
										}
										unit={'$'}
										unitPlace='left'
										mainFontVariant='body1'
										decimalsFontVariant='caption'
									/>
									{')'}
								</Box>
							}
						>
							<TreeItem
								key={x.address}
								nodeId={x.address}
								label={
									<AmountWithCurrency
										amount={x.balance}
										unit={x.symbol}
										mainFontVariant='h6'
										decimalsFontVariant='subtitle1'
									/>
								}
							/>
							{(x.specific || []).map((y, j) => (
								<TreeItem
									key={y.address + '-' + j}
									nodeId={`${1}-${j}`}
									label={
										<Box>
											<AmountWithCurrency
												amount={y.balance}
												unit={y.symbol}
												mainFontVariant='h6'
												decimalsFontVariant='subtitle1'
											/>
											{' ('}
											<AmountWithCurrency
												amount={y.baseTokenBalance[1]}
												unit={y.baseTokenBalance[0] || x.symbol}
												mainFontVariant='body1'
												decimalsFontVariant='caption'
											/>
											{')'}
										</Box>
									}
								/>
							))}
						</TreeItem>
					</TreeView>
				)
			},
		},
	},
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
	setRowProps: (_row, _dataIndex, rowIndex) => {
		return {
			className: clsx(classes.row, {
				[classes.OddRow]: rowIndex % 2 === 0,
			}),
			style: { border: 0, fontSize: '2rem' },
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
				classes,
			}),
		[classes]
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
