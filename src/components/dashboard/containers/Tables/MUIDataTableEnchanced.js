import React from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'

export default function MUIDataTableEnchanced(props) {
	const { title, data, columns, options } = props
	const getMuiTheme = () =>
		createMuiTheme({
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
			},
		})

	return (
		<MuiThemeProvider theme={getMuiTheme()}>
			<MUIDataTable
				title={title}
				data={data}
				columns={columns}
				options={options}
			/>
		</MuiThemeProvider>
	)
}
