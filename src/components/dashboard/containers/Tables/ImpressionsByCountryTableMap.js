import React, { useEffect, useState, Fragment } from 'react'
import { commify } from 'ethers/utils'
import PropTypes from 'prop-types'
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { LinearProgress, Chip, Box } from '@material-ui/core'
import { Timeline } from '@material-ui/icons'
import { t, selectSide, selectCountryStatsMaxValues } from 'selectors'
import { useSelector } from 'react-redux'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { PRIMARY } from 'components/App/themeMUi'
import ReactTooltip from 'react-tooltip' // TEMP: use material-ui tooltip if possible

const BorderLinearProgress = withStyles({
	root: {
		height: 10,
		backgroundColor: lighten(PRIMARY, 0.9),
	},
	bar: {
		backgroundColor: PRIMARY,
	},
})(LinearProgress)

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	margin: {
		margin: theme.spacing(1),
	},
	progressLabel: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 1,
		maxHeight: '75px', // borderlinearprogress root.height
		textAlign: 'center',
		display: 'flex',
		alignItems: 'center',
		'& span': {
			width: '100%',
		},
	},
	chip: {
		background: 'transparent',
		color: PRIMARY,
	},
}))

const getCols = ({ classes, maxImpressions, totalImpressions }) => [
	{
		name: 'countryName',
		label: t('PROP_COUNTRY'),
		options: {
			filter: true,
			sort: false,
			download: true,
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
			customBodyRender: impressions => commify(impressions || 0),
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_PERC'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
			customBodyRender: impressions => {
				const percentage = (
					(impressions / totalImpressions) * 100 || 0
				).toFixed(2)
				return (
					<Box display='flex' flexDirection='column' flex={1}>
						<Box pl={1} pr={1} display='flex' flexDirection='column'>
							<Chip
								color='primary'
								size='small'
								icon={<Timeline />}
								label={`${percentage} %`}
								className={classes.chip}
							/>
						</Box>

						<BorderLinearProgress
							className={classes.margin}
							variant='determinate'
							value={percentage}
						/>
					</Box>
				)
			},
		},
	},
]

const getOptions = ({ reloadData, selected }) => ({
	filterType: 'multiselect',
	rowsSelected: selected,
	customToolbar: () => <ReloadData handleReload={reloadData} />,
})

function ImpressionsByCountryTableMap(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)

	const {
		selector,
		mapChartSelector,
		noActions,
		noClone,
		campaignId,
		selected = [],
	} = props
	const { chartData, colorScale } = useSelector(mapChartSelector)
	const [selectorArgs, setSelectorArgs] = useState({})
	const { maxImpressions, totalImpressions } = useSelector(
		selectCountryStatsMaxValues
	)
	const { data, columns, reloadData } = useTableData({
		selector,
		selectorArgs,
		getColumns: () =>
			getCols({
				classes,
				noActions,
				noClone,
				maxImpressions,
				totalImpressions,
			}),
	})

	// NOTE: despite useTableData hook the component is updating.
	// 'selectorArgs' are object and they have new reference on each update
	// that causes useTableData to update the data on selectorArgs change.
	// If selectorArgs are reference type we need to use useState fot them
	// TODO: find why useTableData causing this update
	useEffect(() => {
		setSelectorArgs({ side, campaignId })
	}, [side, campaignId])

	const [content, setContent] = useState('')

	const options = getOptions({ selected, reloadData })
	return (
		<Fragment>
			<div>
				<MapChart
					setTooltipContent={setContent}
					chartData={chartData}
					colorScale={colorScale}
				/>
				<ReactTooltip>{content}</ReactTooltip>
			</div>
			<MUIDataTableEnhanced
				title={t('TABLE_COUNTRY_STATS_THIS_MONTH')}
				data={data}
				columns={columns}
				options={options}
				noSearch
				noPrint
				noViewColumns
				{...props}
			/>
		</Fragment>
	)
}

ImpressionsByCountryTableMap.propTypes = {
	selector: PropTypes.func.isRequired,
}

export default ImpressionsByCountryTableMap
