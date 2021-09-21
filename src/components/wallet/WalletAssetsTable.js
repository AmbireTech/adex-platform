import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { Box, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { AmountWithCurrency } from 'components/common/amount'
import { selectMainCurrency } from 'selectors'
import { getLogo } from 'services/adex-wallet'
import clsx from 'clsx'
import {
	t,
	selectInitialDataLoaded,
	selectWalletAssetsTableData,
} from 'selectors'
import { useTableData } from 'components/dashboard/containers/Tables/tableHooks'
import {
	WithdrawAsset,
	DepositAsset,
} from 'components/wallet/forms/walletTransactions'

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
			filter: true,
			sort: true,
			customBodyRender: (value = []) => {
				return (
					<Box display='flex' flexDirection='row' alignItems='center'>
						<Avatar
							src={getLogo(value[1])}
							alt={value[0]}
							className={classes.logo}
						/>
						{value[0]} ({value[1]})
					</Box>
				)
			},
		},
	},
	{
		name: 'balanceData',
		label: t('balanceData', { isProp: true }),
		options: {
			filter: false,
			sort: true,
			sortCompare: order => {
				return (obj1, obj2) => {
					const a =
						(obj1.data[1].assetTotalToMainCurrenciesValues || {})['USD'] ||
						obj1.data[0]
					const b =
						(obj2.data[1].assetTotalToMainCurrenciesValues || {})['USD'] ||
						obj2.data[0]
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
					decimals,
					name,
					logoSrc,
				} = balanceData

				const Total = () => (
					<Box className={classes.amountContainer}>
						<Box mr={0.5}>
							<AmountWithCurrency
								amount={total}
								unit={symbol}
								mainFontVariant='subtitle1'
								decimalsFontVariant='subtitle2'
								toFixed={decimals}
							/>
						</Box>
						<Box>
							{'('}
							<AmountWithCurrency
								toFixed={2}
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

				return !specific ||
					!specific.length ||
					(specific &&
						specific.length &&
						!specific.some(x => x.balance > 0)) ? (
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
									<Box key={address} display='flex' flexDirection='row'>
										<Box>
											<AmountWithCurrency
												amount={balance}
												unit={symbol}
												mainFontVariant='subtitle1'
												decimalsFontVariant='subtitle2'
												toFixed={decimals}
											/>
										</Box>
										<Box m={0.5}>
											<WithdrawAsset
												size='small'
												// variant='contained'
												color='secondary'
												stepsProps={{ withdrawAsset: address, symbol, name }}
												dialogWidth={512}
												dialogHeight={800}
												useChip
											/>
										</Box>
										<Box m={0.5}>
											<DepositAsset
												size='small'
												variant='contained'
												color='primary'
												dialogWidth={'100%'}
												dialogHeight={'100%'}
												topUpProps={{ address, symbol, name, logoSrc }}
												useChip
											/>
										</Box>
									</Box>
								}
							/>
							{(specific || []).map((y, index) => (
								<TreeItem
									classes={{ label: classes.amountLabel }}
									key={y.address + '-' + index}
									nodeId={`${y.address}-${index}`}
									label={
										<Box key={address} display='flex' flexDirection='row'>
											<Box>
												<Box className={classes.amountContainer}>
													<Box mr={0.5}>
														<AmountWithCurrency
															amount={y.balance}
															unit={y.symbol}
															mainFontVariant='subtitle1'
															decimalsFontVariant='subtitle2'
															toFixed={y.decimals}
														/>
													</Box>
													<Box>
														{'('}
														<AmountWithCurrency
															amount={y.baseTokenBalance[1]}
															unit={y.baseTokenBalance[0] || symbol}
															mainFontVariant='subtitle1'
															decimalsFontVariant='subtitle2'
															toFixed={y.decimals}
														/>
														{')'}
													</Box>
												</Box>
											</Box>
											<Box m={0.5}>
												<WithdrawAsset
													size='small'
													// variant='contained'
													color='secondary'
													stepsProps={{
														withdrawAsset: y.address,
														symbol: y.symbol,
														name: y.name,
													}}
													dialogWidth={512}
													dialogHeight={800}
													useChip
												/>
											</Box>
											<Box m={0.5}>
												<DepositAsset
													size='small'
													variant='contained'
													color='primary'
													dialogWidth={'100%'}
													dialogHeight={'100%'}
													topUpProps={{
														address: y.address,
														symbol: y.symbol,
														name: y.name,
														logoSrc: y.logoSrc,
													}}
													useChip
												/>
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
	// {
	// 	name: 'share',
	// 	label: t('PROP_SHARE'),
	// 	options: {
	// 		filter: false,
	// 		sort: true,
	// 		customBodyRender: (share = '') => `${share}%`,
	// 	},
	// },
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: false,
			download: false,
			customBodyRender: ({ address, symbol, name, hideBaseActions } = {}) =>
				!hideBaseActions && (
					<Box key={address} display='flex' flexDirection='row'>
						<Box m={0.5}>
							<WithdrawAsset
								size='small'
								// variant='contained'
								color='secondary'
								stepsProps={{ withdrawAsset: address, symbol, name }}
								dialogWidth={512}
								dialogHeight={800}
								useChip
							/>
						</Box>
						<Box m={0.5}>
							<DepositAsset
								size='small'
								variant='contained'
								color='primary'
								dialogWidth={'100%'}
								dialogHeight={'100%'}
								topUpProps={{ address, symbol, name }}
								useChip
							/>
						</Box>
					</Box>
				),
		},
	},
]

const getOptions = ({ classes }) => ({
	// filterType: 'multiselect',
	sortOrder: {
		name: 'balance',
		direction: 'desc',
	},
	selectableRows: 'none',
	rowsPerPage: 5,
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
