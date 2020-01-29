import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { t, selectAdSlots, selectSide } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime } from 'helpers/formatters'
const RRIconButton = withReactRouterLink(IconButton)

function AdSlotsTable(props) {
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const adSlots = useSelector(selectAdSlots)
	const side = useSelector(selectSide)
	const data = Object.values(adSlots).map(item => ({
		media: {
			id: item.id,
			mediaUrl: item.fallbackUnit ? `ipfs://${item.fallbackUnit}` : '', //TODO: provide fallback image to slot
			mediaMime: 'image/jpeg',
		},
		title: item.title,
		type: item.type.replace('legacy_', ''),
		created: item.created,
		actions: {
			to: `/dashboard/${side}/AdSlot/${item.id}`,
			id: item.id,
		},
	}))
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
			name: 'title',
			label: t('PROP_STATUS'),
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: 'type',
			label: t('PROP_TYPE'),
			options: {
				filter: true,
				sort: true,
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
			name: 'actions',
			label: t('ACTIONS'),
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
	return (
		<MUIDataTableEnchanced
			title={t('ALL_UNITS')}
			data={data}
			columns={columns}
			options={{
				filterType: 'multiselect',
				selectableRows: 'none',
			}}
			{...props}
		/>
	)
}

AdSlotsTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default AdSlotsTable
