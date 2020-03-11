import React from 'react'
import Chart from 'react-google-charts'
import { Paper } from '@material-ui/core'
import { PRIMARY_LIGHT, PRIMARY_DARK } from 'components/App/themeMUi'

function ChartGeo({ data }) {
	return (
		<Paper elevation={2}>
			<Chart
				chartType='GeoChart'
				width='100%'
				height='400px'
				data={data}
				options={{
					colorAxis: { colors: [PRIMARY_LIGHT, PRIMARY_DARK] },
					// backgroundColor: '#81d4fa',
					// datalessRegionColor: '#ffffff',
					// defaultColor: '#f5f5f5',
				}}
			/>
		</Paper>
	)
}

export default ChartGeo
