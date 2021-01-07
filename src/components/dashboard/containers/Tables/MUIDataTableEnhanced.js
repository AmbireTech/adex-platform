import React from 'react'
import MUIDataTable from 'mui-datatables'
import { LinearProgress, Box, Button } from '@material-ui/core'
import { t, selectTableState } from 'selectors'
import { updateTableState, execute } from 'actions'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'

const generalTableOptions = {
	rowsPerPage: 5,
	rowsPerPageOptions: [5, 10, 25, 50, 100],
	setTableProps: () => {
		return {
			padding: 'default',
			size: 'small',
			width: '100%',
			align: 'center',
		}
	},
	textLabels: {
		body: {
			noMatch: t('TABLE_NO_MATCH'),
			toolTip: t('TABLE_TOOLTIP'),
			columnHeaderTooltip: column =>
				`${t('TABLE_HEADER_TOOLTIP', {
					args: [column.label || column],
				})}`,
		},
		pagination: {
			next: t('TABLE_NEXT'),
			previous: t('TABLE_PREV'),
			rowsPerPage: t('TABLE_ROWS_PER_PAGE'),
			displayRows: t('TABLE_DISPLAY_ROWS'),
		},
		toolbar: {
			search: t('TABLE_SEARCH'),
			downloadCsv: t('TABLE_DL_CSV'),
			print: t('TABLE_PRINT'),
			viewColumns: t('TABLE_VIEW_COLS'),
			filterTable: t('TABLE_FILTER'),
		},
		filter: {
			all: t('TABLE_FILTER_ALL'),
			title: t('TABLE_FILTER_TITLE'),
			reset: t('TABLE_FILTER_RESET'),
		},
		viewColumns: {
			title: t('TABLE_SHOW_COLS'),
			titleAria: t('TABLE_SHOW_HIDE_COLS'),
		},
		selectedRows: {
			text: t('TABLE_SELECTED_ROWS'),
			delete: t('TABLE_DELETE'),
			deleteAria: t('TABLE_DELETE_SELECTED'),
		},
	},
	customFilterDialogFooter: (_currentFilterList, applyNewFilters) => {
		return (
			<div style={{ marginTop: '40px' }}>
				<Button variant='contained' color='secondary' onClick={applyNewFilters}>
					{t('APPLY_FILTERS')}
				</Button>
			</div>
		)
	},
}

const useStyles = makeStyles(theme => {
	return {
		progress: {
			width: '100%',
		},
	}
})

export default function MUIDataTableEnhanced(props) {
	const { title, data, columns, options, loading, tableId } = props
	const classes = useStyles()
	const { filterList, ...tableState } = useSelector(state =>
		selectTableState(state, tableId)
	)

	const columnsWithFilters = columns.map(({ options, ...col }, i) => ({
		...col,
		...{
			options: {
				...options,
				...(filterList && filterList[i] && filterList[i].length
					? { filterList: filterList[i] }
					: {}),
			},
		},
	}))

	return (
		<Box>
			<MUIDataTable
				title={title}
				data={data}
				columns={columnsWithFilters}
				options={{
					...generalTableOptions,
					...options,
					elevation: 0,
					variant: 'outlined',
					confirmFilters: true,
					search: !props.noSearch,
					download: !props.noDownload,
					print: !props.noPrint,
					selectableRows: props.rowSelectable ? 'multiple' : 'none',
					disableToolbarSelect: props.toolbarEnabled ? false : true,
					responsive: 'vertical',
					...tableState,
					onTableChange: (action, newTableState) => {
						if (
							![
								'onFilterDialogOpen',
								'onFilterDialogClose',
								'propsUpdate',
								'filterChange',
								'rowSelectionChange',
							].includes(action)
						) {
							execute(
								updateTableState(tableId, { ...newTableState, filterList })
							)
						}
					},
					onFilterConfirm: filterList => {
						execute(updateTableState(tableId, { ...tableState, filterList }))
					},
					onFilterChipClose: filterList => {
						execute(updateTableState(tableId, { ...tableState, filterList }))
					},
					onRowSelectionChange: (
						_currentRowsSelected,
						_allRowsSelected,
						rowsSelected
					) => {
						execute(
							updateTableState(tableId, {
								...tableState,
								filterList,
								rowsSelected,
							})
						)
					},
				}}
			/>
			{loading && <LinearProgress className={classes.progress} />}
		</Box>
	)
}
