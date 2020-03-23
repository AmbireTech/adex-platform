import React, { memo } from 'react'
import {
	ZoomableGroup,
	ComposableMap,
	Geographies,
	Geography,
} from 'react-simple-maps'
import { formatAbbrNum } from 'helpers/formatters'

const MapChart = ({ setTooltipContent, chartData, colorScale }) => {
	return (
		<>
			<ComposableMap
				data-tip=''
				projectionConfig={{ scale: 170, parallels: true }}
			>
				<ZoomableGroup maxZoom={3}>
					<Geographies geography={chartData}>
						{({ geographies = [] }) => {
							return geographies.map(geo => {
								const { name, impressions } = geo.properties
								return (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										onMouseEnter={() => {
											setTooltipContent(
												`${name} — ${formatAbbrNum(impressions, 2)}`
											)
										}}
										onMouseLeave={() => {
											setTooltipContent('')
										}}
										fill={geo.id ? colorScale(impressions) : '#F5F4F6'}
										style={{
											default: {
												stroke: 'white',
												outline: 'none',
											},
											hover: {
												fill: 'orange',
												outline: 'none',
											},
											pressed: {
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
		</>
	)
}

export default memo(MapChart)
