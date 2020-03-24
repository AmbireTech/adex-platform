import React from 'react'
import { commify } from 'ethers/utils'
import PropTypes from 'prop-types'
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { LinearProgress, Chip, Box } from '@material-ui/core'
import { Timeline } from '@material-ui/icons'
import { t } from 'selectors'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import { PRIMARY } from 'components/App/themeMUi'

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

const getCols = ({ classes }) => [
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
		name: 'percentImpressions',
		label: t('LABEL_PERC'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: percentImpressions => {
				return (
					<Box display='flex' flexDirection='column' flex={1}>
						<Box pl={1} pr={1} display='flex' flexDirection='column'>
							<Chip
								color='primary'
								size='small'
								icon={<Timeline />}
								label={`${percentImpressions.toFixed(2)} %`}
								className={classes.chip}
							/>
						</Box>

						<BorderLinearProgress
							className={classes.margin}
							variant='determinate'
							value={percentImpressions}
						/>
					</Box>
				)
			},
		},
	},
	{
		name: 'clicks',
		label: t('LABEL_CLICKS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: impressions => commify(impressions || 0),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: ctr => `${ctr.toFixed(4)} %`,
		},
	},
]

const getOptions = ({ reloadData, selected }) => ({
	filterType: 'multiselect',
	rowsSelected: selected,
	customToolbar: () => <ReloadData handleReload={reloadData} />,
})

function StatsByCountryTable(props) {
	const classes = useStyles()

	const { selector, noActions, noClone, selected = [] } = props

	const { data, columns, reloadData } = useTableData({
		selector,
		getColumns: () =>
			getCols({
				classes,
				noActions,
				noClone,
			}),
	})

	const options = getOptions({ selected, reloadData })
	return (
		<Box>
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
		</Box>
	)
}

StatsByCountryTable.propTypes = {
	selector: PropTypes.func.isRequired,
}

export default StatsByCountryTable
