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
					height='384px'
					data={data}
					options={{
						colorAxis: { colors: [PRIMARY_LIGHT, PRIMARY_DARK] },
						sizeAxis: { minValue: 0, maxValue: 100 },
						keepAspectRatio: true,
						tooltip: { isHtml: true }, //Fixes flickering issue when you move the mouse between countries
					}}
				/>
			</Box>
		</Paper>
	)
}

export default ChartGeo
