import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
	ZoomableGroup,
	ComposableMap,
	Geographies,
	Geography,
} from 'react-simple-maps'
import { Paper } from '@material-ui/core'
import ReactTooltip from 'react-tooltip'
import { ALEX_GREY } from 'components/App/themeMUi'

const MapChart = ({ selector, chartId }) => {
	const { chartData, hoverColor, pressedColor } = useSelector(selector)

	const [content, setContent] = useState('')

	return (
		<Paper elevation={2} variant='outlined' square>
			<ComposableMap
				id={chartId}
				data-tip='chart-map'
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
								const { tooltipElements, fillColor } = geo.properties
								return (
									<Geography
										key={geo.rsmKey}
										geography={geo}
										onMouseEnter={() => {
											setContent(tooltipElements)
										}}
										onMouseLeave={() => {
											setContent('')
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
			{/* TODO: use material-ui tooltip ot popover */}
			{!!content && (
				<ReactTooltip border={false} backgroundColor={ALEX_GREY}>
					{Array.isArray(content)
						? content.map((x, i) => <div key={i}>{x}</div>)
						: content}
				</ReactTooltip>
			)}
		</Paper>
	)
}

export default MapChart
