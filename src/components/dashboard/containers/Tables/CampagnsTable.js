import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {
	TextField,
	FormControlLabel,
	FormGroup,
	FormLabel,
	FormControl,
	ListItemText,
	Checkbox,
	Select,
	InputLabel,
	MenuItem,
	Tooltip,
	IconButton,
	Typography,
	Slider,
	Box,
} from '@material-ui/core'
import {
	Visibility,
	DoneAll,
	Warning,
	HourglassFull,
	MonetizationOn,
} from '@material-ui/icons'
import Img from 'components/common/img/Img'

import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { t, selectCampaigns, selectMainToken, selectSide } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { bigNumberify } from 'ethers/utils'
import { useSelector } from 'react-redux'
import {
	formatNumberWithCommas,
	formatDateTime,
	formatTokenAmount,
} from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(theme => ({
	cellImg: {
		width: 'auto',
		height: 'auto',
		maxHeight: 70,
		maxWidth: 180,
		cursor: 'pointer',
	},
}))

function CampagnsTable(props) {
	const classes = useStyles()
	const campaigns = useSelector(selectCampaigns)
	const { symbol, decimals } = useSelector(selectMainToken)
	const side = useSelector(selectSide)
	const [depositFilter, setDepositFilter] = React.useState([0, 100])
	const columns = [
		{
			name: 'media',
			label: t('PROP_MEDIA'),
			options: {
				filter: false,
				sort: false,
				customBodyRender: ({ id, adUnits }) => {
					return (
						// TODO: Images issue some stop displaying
						<Img
							fullScreenOnClick={true}
							className={classnames(classes.cellImg)}
							src={adUnits[0].mediaUrl}
							alt={id}
							mediaMime={adUnits[0].mediaMime}
							allowVideo
						/>
					)
				},
			},
		},
		{
			name: 'status',
			label: t('PROP_STATUS'),
			options: {
				filter: true,
				sort: true,
				filterOptions: {
					names: ['Active', 'Closed', 'Completed'],
					logic: (status, filters) => {
						if (filters.length)
							return !filters.includes(status.humanFriendlyName)
						return false
					},
				},
				customBodyRender: ({ humanFriendlyName, originalName }) => (
					<React.Fragment>
						{humanFriendlyName}{' '}
						{mapStatusIcons(humanFriendlyName, originalName, 'xs')}
					</React.Fragment>
				),
				// TODO: Sorting issue
			},
		},
		{
			name: 'depositAmount',
			label: t('PROP_DEPOSIT'),
			options: {
				customBodyRender: depositAmount => (
					<React.Fragment>
						{formatTokenAmount(depositAmount, decimals, true)}
						{` ${symbol}`}
					</React.Fragment>
				),
				...sliderFilterOptions([0, 5000], t('DEPOSIT_FILTER')),
			},
		},
		{
			name: 'fundsDistributedRatio',
			label: t('PROP_DISTRIBUTED'),
			options: {
				filter: true,
				sort: true,
				customBodyRender: fundsDistributedRatio =>
					((fundsDistributedRatio || 0) / 10).toFixed(2),
			},
		},
		{
			name: 'impressions',
			label: t('PROP_IMPRESSIONS'),
			options: {
				filter: true,
				sort: true,
				customBodyRender: impressions =>
					formatNumberWithCommas(impressions || 0),
			},
		},
		{
			name: 'clicks',
			label: t('CHART_LABEL_CLICKS'),
			options: {
				filter: true,
				sort: true,
				customBodyRender: clicks => formatNumberWithCommas(clicks || 0),
			},
		},
		{
			name: 'minPerImpression',
			label: t('PROP_CPM'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: minPerImpression => (
					<React.Fragment>
						{formatTokenAmount(
							bigNumberify(minPerImpression).mul(1000),
							decimals,
							true
						)}
						{` ${symbol}`}
					</React.Fragment>
				),
			},
		},
		{
			name: 'created',
			label: t('PROP_CREATED'),
			options: {
				filter: false,
				sort: true,
				sortDirection: 'desc',
				customBodyRender: created => formatDateTime(created),
			},
		},
		{
			name: 'activeFrom',
			label: t('PROP_STARTS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: activeFrom => formatDateTime(activeFrom),
			},
		},
		{
			name: 'withdrawPeriodStart',
			label: t('PROP_ENDS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: withdrawPeriodStart =>
					formatDateTime(withdrawPeriodStart),
			},
		},
		{
			name: 'actions',
			label: t('PROP_ACTIONS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ to }) => (
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton to={to} variant='contained' aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
				),
			},
		},
	]
	const data = Object.values(campaigns).map(item => ({
		media: {
			id: item.id,
			adUnits: item.adUnits,
		},
		status: {
			humanFriendlyName: item.status.humanFriendlyName,
			originalName: item.status.name,
		},
		depositAmount: item.depositAmount || 0,
		fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
		impressions: item.impressions || 0,
		clicks: item.clicks || 0,
		minPerImpression: item.spec.minPerImpression || 0,
		created: item.created,
		activeFrom: item.spec.withdrawPeriodStart,
		withdrawPeriodStart: item.spec.withdrawPeriodStart,
		actions: {
			to: `/dashboard/${side}/Campaign/${item.id}`,
		},
	}))
	const [pageNum, setPageNum] = React.useState(0)
	return (
		<MUIDataTableEnchanced
			title={t('ALL_CAMPAIGNS')}
			data={data}
			columns={columns}
			options={{
				filterType: 'multiselect',
				selectableRows: 'none',
				page: pageNum,
				onChangePage: num => setPageNum(num),
			}}
		/>
	)
}

const mapStatusIcons = (humanFriendlyStatus, status, size) => {
	const icon = {
		xs: { fontSize: 10 },
		md: { fontSize: 15 },
		ls: { fontSize: 20 },
	}
	const waitIcon = <HourglassFull style={icon[size]} color={'secondary'} />
	const doneIcon = <DoneAll style={icon[size]} color={'primary'} />
	const warningIcon = <Warning style={icon[size]} color={'error'} />
	const cashIcon = <MonetizationOn style={icon[size]} color={'accentTwo'} />
	if (humanFriendlyStatus === 'Closed' && status.toLowerCase() !== 'exhausted')
		return waitIcon
	switch (status.toLowerCase()) {
		case 'active':
		case 'ready':
			return doneIcon
		case 'pending':
		case 'initializing':
		case 'waiting':
			return waitIcon
		case 'offline':
		case 'disconnected':
		case 'unhealthy':
		case 'invalid':
			return warningIcon
		case 'withdraw':
			return cashIcon
		default:
			return ''
	}
}

CampagnsTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default CampagnsTable
