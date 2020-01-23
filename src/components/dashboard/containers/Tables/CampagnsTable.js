import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Img from 'components/common/img/Img'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import WarningIcon from '@material-ui/icons/Warning'
import HourglassFullIcon from '@material-ui/icons/HourglassFull'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import { t, selectCampaigns, selectMainToken } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { useSelector } from 'react-redux'
import {
	formatNumberWithCommas,
	formatDateTime,
	formatTokenAmount,
} from 'helpers/formatters'

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
	const columns = [
		{
			name: 'media',
			label: t('PROP_MEDIA'),
			options: {
				filter: false,
				sort: false,
				customBodyRender: ({ id, mediaUrl, mediaMime }) => {
					return (
						<Img
							fullScreenOnClick={true}
							className={classnames(classes.cellImg)}
							src={mediaUrl}
							alt={id}
							mediaMime={mediaMime}
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
				filter: false,
				sort: true,
				customBodyRender: depositAmount => (
					<React.Fragment>
						{formatTokenAmount(depositAmount, decimals, true)}
						{` ${symbol}`}
					</React.Fragment>
				),
			},
		},
		{
			name: 'fundsDistributedRatio',
			label: t('PROP_DISTRIBUTED'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'impressions',
			label: t('PROP_IMPRESSIONS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'clicks',
			label: t('CHART_LABEL_CLICKS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'minPerImpression',
			label: t('PROP_CPM'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'created',
			label: t('PROP_CREATED'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'activeFrom',
			label: t('PROP_STARTS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
		{
			name: 'withdrawPeriodStart',
			label: t('PROP_ENDS'),
			options: {
				filter: false,
				sort: true,
				customBodyRender: ({ id, fullName }) => (
					<a href={`/customers/`}>TEST</a>
				),
			},
		},
	]
	const data = Object.values(campaigns).map(item => ({
		media: {
			id: item.id,
			mediaUrl: item.adUnits[0].mediaUrl,
			mediaMime: item.adUnits[0].mediaMime,
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
	}))
	return (
		<MUIDataTableEnchanced
			title={t('CAMPAIGN_STATS_BREAKDOWN')}
			data={data}
			columns={columns}
			options={{
				filterType: 'multiselect',
				selectableRows: 'none',
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
	const waitIcon = <HourglassFullIcon style={icon[size]} color={'secondary'} />
	const doneIcon = <DoneAllIcon style={icon[size]} color={'primary'} />
	const warningIcon = <WarningIcon style={icon[size]} color={'error'} />
	const cashIcon = <MonetizationOnIcon style={icon[size]} color={'accentTwo'} />
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
