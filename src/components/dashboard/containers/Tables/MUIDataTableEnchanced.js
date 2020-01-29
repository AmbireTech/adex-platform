import React from 'react'
import MUIDataTable from 'mui-datatables'
import { theme } from 'components/App/themeMUi'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { t } from 'selectors'

export default function MUIDataTableEnchanced(props) {
	const { title, data, columns, options } = props
	const getMuiTheme = () =>
		createMuiTheme({
			...theme,
			overrides: {
				MuiTableFooter: {
					root: {
						display: 'flex',
						flex: 0,
						padding: 0,
					},
				},
				MUIDataTablePagination: {
					toolbar: {
						padding: 0,
					},
				},
				MUIDataTableFilter: {
					root: {
						maxWidth: '400px',
					},
				},
				// Think of accessing an element not a class
				MuiGridListTile: {
					root: {
						width: '100% !important',
					},
				},
				MUIDataTableBodyCell: {
					stackedCommon: {
						height: '80px !important',
					},
				},
				...theme.overrides,
			},
		})
	const generalTableOptions = {
		rowsPerPage: 5,
		rowsPerPageOptions: [5, 10, 25, 50, 100, 500],
		setTableProps: () => {
			return {
				padding: 'default',
				size: 'small',
				tableLayout: 'auto',
				width: '100%',
				align: 'center',
				whiteSpace: 'wrap',
			}
		},
		textLabels: {
			body: {
				noMatch: t('TABLE_NO_MATCH'),
				toolTip: t('TABLE_TOOLTIP'),
				columnHeaderTooltip: column =>
					`${t('TABLE_HEADER_TOOLTIP', {
						args: [column.label],
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
	}
	return (
		<MuiThemeProvider theme={getMuiTheme()}>
			<MUIDataTable
				title={title}
				data={data}
				columns={columns}
				options={{
					...generalTableOptions,
					...options,
					search: !props.noSearch,
					download: !props.noDownload,
					print: !props.noPrint,
					selectableRows: props.rowSelectable ? 'multiple' : 'none',
					customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
						//This disables toolbar when selected elements on all tables
					},
				}}
			/>
		</MuiThemeProvider>
	)
}
