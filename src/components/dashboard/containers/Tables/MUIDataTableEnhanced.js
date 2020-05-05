import React, { Fragment } from 'react'
import MUIDataTable from 'mui-datatables'
import { LinearProgress, Paper } from '@material-ui/core'
import { t } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'

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
}

const useStyles = makeStyles(theme => {
	return {
		progress: {
			width: '100%',
		},
	}
})

export default function MUIDataTableEnhanced(props) {
	const { title, data, columns, options, loading } = props
	const classes = useStyles()
	return (
		<Paper variant='outlined'>
			<MUIDataTable
				title={title}
				data={data}
				columns={columns}
				options={{
					...generalTableOptions,
					...options,
					elevation: 0,
					variant: 'outlined',
					search: !props.noSearch,
					download: !props.noDownload,
					print: !props.noPrint,
					selectableRows: props.rowSelectable ? 'multiple' : 'none',
					disableToolbarSelect: props.toolbarEnabled ? false : true,
					responsive: 'stacked',
				}}
			/>
			{loading && <LinearProgress className={classes.progress} />}
		</Paper>
	)
}
