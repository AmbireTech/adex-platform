import React, { useEffect, useState, Fragment } from 'react'
import { commify } from 'ethers/utils'
import {
	lighten,
	makeStyles,
	withStyles,
	createMuiTheme,
	MuiThemeProvider,
} from '@material-ui/core/styles'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { LinearProgress, Chip, Box } from '@material-ui/core'
import { Timeline } from '@material-ui/icons'
import {
	t,
	selectSide,
	selectPublisherStatsByCountryTableData,
	selectCountryStatsMaxValues,
} from 'selectors'
import { useSelector } from 'react-redux'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import ChartGeo from 'components/dashboard/charts/map/ChartGeo'
import { PRIMARY, theme } from 'components/App/themeMUi'

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

const getMuiTheme = () =>
	createMuiTheme({
		...theme,
		overrides: {
			MUIDataTableHeadCell: {
				root: {
					'&:nth-child(1)': {
						width: 200,
					},
					'&:nth-child(2)': {
						width: 70,
					},
				},
			},
		},
	})

function PublisherImprByCountry(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const { noActions, noClone, campaignId, selected = [] } = props

	const [selectorArgs, setSelectorArgs] = useState({})
	const { maxImpressions, totalImpressions } = useSelector(
		selectCountryStatsMaxValues
	)
	const { data, columns, reloadData } = useTableData({
		selector: selectPublisherStatsByCountryTableData,
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

	const geoChartData = data.map(item => [
		item.countryCode,
		item.countryName,
		item.impressions,
	])
	// NOTE: despite useTableData hook the component is updating.
	// 'selectorArgs' are object and they have new reference on each update
	// that causes useTableData to update the data on selectorArgs change.
	// If selectorArgs are reference type we need to use useState fot them
	// TODO: find why useTableData causing this update
	useEffect(() => {
		setSelectorArgs({ side, campaignId })
	}, [side, campaignId])

	const options = getOptions({ selected, reloadData })
	return (
		<Fragment>
			<ChartGeo
				data={[
					[t('MAP_COUNTRY_CODE'), t('MAP_COUNTRY'), t('MAP_POPULARITY')],
					...geoChartData,
				]}
			/>
			<MuiThemeProvider theme={getMuiTheme()}>
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
			</MuiThemeProvider>
		</Fragment>
	)
}

export default PublisherImprByCountry
