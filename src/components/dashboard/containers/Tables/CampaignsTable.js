import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { mapStatusIcons } from 'components/dashboard/containers/Tables/tableHelpers'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { t, selectCampaigns, selectMainToken, selectSide } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { bigNumberify } from 'ethers/utils'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import {
	formatNumberWithCommas,
	formatDateTime,
	formatTokenAmount,
} from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
const RRIconButton = withReactRouterLink(IconButton)

function CampaignsTable(props) {
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const campaigns = useSelector(selectCampaigns)
	const { symbol, decimals } = useSelector(selectMainToken)
	const side = useSelector(selectSide)
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
				sort: false,
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
				...sliderFilterOptions({
					initial: [
						0,
						Math.max(
							...Object.values(campaigns).map(i =>
								Number(formatTokenAmount(i.depositAmount, decimals) || 0)
							)
						),
					],
					filterTitle: t('DEPOSIT_FILTER'),
					isToken: true,
					decimals: decimals,
				}),
			},
		},
		{
			name: 'fundsDistributedRatio',
			label: t('PROP_DISTRIBUTED'),
			options: {
				sort: true,
				customBodyRender: fundsDistributedRatio =>
					((fundsDistributedRatio || 0) / 10).toFixed(2),
				...sliderFilterOptions({
					initial: [0, 100],
					filterTitle: t('DISTRIBUTED_FILTER'),
				}),
			},
		},
		{
			name: 'impressions',
			label: t('PROP_IMPRESSIONS'),
			options: {
				sort: true,
				customBodyRender: impressions =>
					formatNumberWithCommas(impressions || 0),
				...sliderFilterOptions({
					initial: [
						0,
						Math.max(
							...Object.values(campaigns).map(i => Number(i.impressions || 0))
						),
					],
					filterTitle: t('IMPRESSIONS_FILTER'),
				}),
			},
		},
		{
			name: 'clicks',
			label: t('CHART_LABEL_CLICKS'),
			options: {
				sort: true,
				customBodyRender: clicks => formatNumberWithCommas(clicks || 0),
				...sliderFilterOptions({
					initial: [
						0,
						Math.max(
							...Object.values(campaigns).map(i => Number(i.clicks || 0))
						),
					],
					filterTitle: t('CLICKS_FILTER'),
				}),
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
				download: false,
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
	return (
		<MUIDataTableEnchanced
			title={t('ALL_CAMPAIGNS')}
			data={data}
			columns={columns}
			options={{
				filterType: 'multiselect',
				selectableRows: 'none',
				onDownload: (buildHead, buildBody, columns, data) => {
					const mappedData = data.map(i => ({
						index: i.index,
						data: [
							i.data[0].id,
							i.data[1].humanFriendlyName,
							`${formatTokenAmount(
								bigNumberify(i.data[2]).mul(1000),
								decimals,
								true
							)} ${symbol}`,
							`${((i.data[3] || 0) / 10).toFixed(2)}%`,
							i.data[4],
							i.data[5],
							`${formatTokenAmount(
								bigNumberify(i.data[6]).mul(1000),
								decimals,
								true
							)} ${symbol}`,
							formatDateTime(i.data[7]),
							formatDateTime(i.data[8]),
							formatDateTime(i.data[9]),
						],
					}))
					return `${buildHead(columns)}${buildBody(mappedData)}`.trim()
				},
			}}
			{...props}
		/>
	)
}

CampaignsTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default CampaignsTable
