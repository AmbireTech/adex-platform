import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { t, selectSide, selectAdSlotsTableData } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useStore } from 'react-redux'
import { styles } from './styles'
import { formatDateTime } from 'helpers/formatters'
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(styles)

const getCols = ({ classes }) => [
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

const options = {
	filterType: 'multiselect',
	selectableRows: 'none',
}

function AdSlotsTable(props) {
	const classes = useStyles()
	const { getState } = useStore()
	const side = useSelector(selectSide)

	const [cols, setCols] = useState([])
	const [data, setData] = useState([])

	useEffect(() => {
		const state = getState()
		setData(selectAdSlotsTableData(state, side))
		setCols(
			getCols({
				classes,
			})
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<MUIDataTableEnhanced
			title={t('ALL_SLOTS')}
			data={data}
			columns={cols}
			options={options}
			{...props}
		/>
	)
}

export default AdSlotsTable
