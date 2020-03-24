import React, { memo } from 'react'
import {
	ZoomableGroup,
	ComposableMap,
	Geographies,
	Geography,
} from 'react-simple-maps'
import { Paper, Typography } from '@material-ui/core'

const MapChart = ({
	setTooltipContent,
	chartData,
	hoverColor,
	pressedColor,
	title,
}) => {
	return (
		<Paper elevation={2} square>
			{title && <Typography variant='h6'>{title}</Typography>}
			<ComposableMap
				data-tip=''
				projection='geoMercator'
				projectionConfig={{
					scale: 100,
				}}
				width={666}
				height={420}
			>
				<ZoomableGroup maxZoom={3}>
					<Geographies geography={chartData}>
						{({ geographies = [] }) => {
							return geographies.map(geo => {
								const { tooltipText, fillColor } = geo.properties
								return (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										onMouseEnter={() => {
											setTooltipContent(tooltipText)
										}}
										onMouseLeave={() => {
											setTooltipContent('')
										}}
										fill={fillColor}
										style={{
											default: {
												stroke: 'white',
												outline: 'none',
											},
											hover: {
												fill: hoverColor,
												outline: 'none',
											},
											pressed: {
												fill: pressedColor,
												outline: 'none',
											},
										}}
									/>
								)
							})
						}}
					</Geographies>
				</ZoomableGroup>
			</ComposableMap>
		</Paper>
	)
}

export default MapChart
