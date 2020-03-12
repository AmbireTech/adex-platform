import React from 'react'
import Chart from 'react-google-charts'
import { Paper, Box } from '@material-ui/core'
import { PRIMARY_LIGHT, PRIMARY_DARK } from 'components/App/themeMUi'

function ChartGeo({ data }) {
	return (
		<Paper elevation={2}>
			<Box p={1}>
				<Chart
					chartType='GeoChart'
					width='100%'
					height='468px'
					data={data}
					options={{
						colorAxis: { colors: [PRIMARY_LIGHT, PRIMARY_DARK] },
						// backgroundColor: '#81d4fa',
						// datalessRegionColor: '#ffffff',
						// defaultColor: '#f5f5f5',
					}}
				/>
			</Box>
		</Paper>
	)
}

export default ChartGeo
