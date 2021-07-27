import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { Box, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { AmountWithCurrency } from 'components/common/amount'
import { selectMainCurrency } from 'selectors'
import clsx from 'clsx'
import {
	t,
	selectInitialDataLoaded,
	selectWalletAssetsTableData,
} from 'selectors'
import { useTableData } from 'components/dashboard/containers/Tables/tableHooks'
import { WithdrawAsset } from 'components/wallet/forms/walletTransactions'

const styles = theme => {
	return {
		OddRow: {
			backgroundColor: theme.palette.background.default,
		},
		logo: {
			marginRight: theme.spacing(1),
		},
		amountContainer: {
			display: 'flex',
			flexDirections: 'row',
			flexWrap: 'wrap',
		},
		amountLabelMain: {
			fontWeight: 'inherit',
		},
		amountLabel: {
			fontWeight: 'inherit',
			borderBottom: `1px solid ${theme.palette.divider}`,
		},
	}
}

const useStyles = makeStyles(styles)

const getCols = ({ classes, mainCurrency = {} }) => [
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
		name: 'balanceData',
		label: t('balanceData', { isProp: true }),
		options: {
			filter: true,
			sort: true,
			sortCompare: order => {
				return (obj1, obj2) => {
					const [a] = obj1.data
					const [b] = obj2.data
					return (a - b) * (order === 'desc' ? -1 : 1)
				}
			},
			customBodyRender: ([balance, balanceData] = []) => {
				const {
					specific,
					address,
					total,
					symbol,
					assetTotalToMainCurrenciesValues,
				} = balanceData

				const Total = () => (
					<Box className={classes.amountContainer}>
						<AmountWithCurrency
							amount={total}
							unit={symbol}
							mainFontVariant='subtitle1'
							decimalsFontVariant='subtitle2'
						/>{' '}
						<Box>
							{'('}{' '}
							<AmountWithCurrency
								amount={
									(assetTotalToMainCurrenciesValues || {})[mainCurrency.id]
								}
								unit={mainCurrency.symbol}
								unitPlace={mainCurrency.symbolPosition}
								mainFontVariant='subtitle1'
								decimalsFontVariant='subtitle2'
							/>
							{')'}
						</Box>
					</Box>
				)

				return !specific || !specific.length ? (
					<Total />
				) : (
					<TreeView
						defaultCollapseIcon={<ExpandMore />}
						defaultExpandIcon={<ChevronRight />}
					>
						<TreeItem
							classes={{ label: classes.amountLabelMain }}
							nodeId={address + '-total'}
							label={<Total />}
						>
							<TreeItem
								classes={{ label: classes.amountLabel }}
								nodeId={address + '-balance'}
								label={
									<AmountWithCurrency
										amount={balance}
										unit={symbol}
										mainFontVariant='subtitle1'
										decimalsFontVariant='subtitle2'
									/>
								}
							/>
							{(specific || []).map((y, index) => (
								<TreeItem
									classes={{ label: classes.amountLabel }}
									key={y.address + '-' + index}
									nodeId={`${y.address}-${index}`}
									label={
										<Box className={classes.amountContainer}>
											<AmountWithCurrency
												amount={y.balance}
												unit={y.symbol}
												mainFontVariant='subtitle1'
												decimalsFontVariant='subtitle2'
											/>{' '}
											<Box>
												{' ('}
												<AmountWithCurrency
													amount={y.baseTokenBalance[1]}
													unit={y.baseTokenBalance[0] || symbol}
													mainFontVariant='subtitle1'
													decimalsFontVariant='subtitle2'
												/>
												{')'}
											</Box>
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
			customBodyRender: ({ address, symbol } = {}) => (
				<Box key={address}>
					<WithdrawAsset
						size='small'
						variant='contained'
						color='secondary'
						stepsProps={{ withdrawAsset: address, symbol }}
						dialogWidth={512}
						dialogHeight={800}
					/>
				</Box>
			),
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
	const mainCurrency = useSelector(selectMainCurrency)

	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() =>
			getCols({
				classes,
				mainCurrency,
			}),
		[classes, mainCurrency]
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
			tableId='wallet-stats-table'
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
