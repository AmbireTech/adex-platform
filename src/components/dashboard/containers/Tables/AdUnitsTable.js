import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { t, selectAdUnits, selectSide } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime } from 'helpers/formatters'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { AdUnit } from 'adex-models'
import { execute, cloneItem } from 'actions'
const RRIconButton = withReactRouterLink(IconButton)

function AdUnitsTable(props) {
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const adUnits = useSelector(selectAdUnits)
	const side = useSelector(selectSide)
	const data = Object.values(props.items || adUnits).map(item => ({
		media: {
			id: item.id,
			mediaUrl: item.mediaUrl,
			mediaMime: item.mediaMime,
		},
		title: item.title || adUnits[item.ipfs].title,
		type: item.type.replace('legacy_', ''),
		created: item.created,
		actions: {
			to: `/dashboard/${side}/AdUnit/${item.id || item.ipfs}`,
			id: item.id || item.ipfs,
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
			label: t('PROP_TITLE'),
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
			label: t('PROP_ACTIONS'),
			options: {
				filter: false,
				// display: !props.campaignUnits,
				sort: true,
				customBodyRender: ({ to, id }) => (
					<React.Fragment>
						<Tooltip
							title={t('LABEL_VIEW')}
							// placement='top'
							enterDelay={1000}
						>
							<RRIconButton to={to} variant='contained' aria-label='preview'>
								<Visibility color='primary' />
							</RRIconButton>
						</Tooltip>
						{!props.noActions && (
							<Tooltip
								title={t('TOOLTIP_CLONE')}
								// placement='top'
								enterDelay={1000}
							>
								<span>
									<NewCloneUnitDialog
										onBeforeOpen={() =>
											execute(
												cloneItem({
													item: adUnits[id],
													itemType: 'AdUnit',
													objModel: AdUnit,
												})
											)
										}
										iconButton
									/>
								</span>
							</Tooltip>
						)}
					</React.Fragment>
				),
			},
		},
	]
	return (
		<MUIDataTableEnchanced
			title={props.campaignUnits ? t('CAMPAIGN_AD_UNITS') : t('ALL_UNITS')}
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

AdUnitsTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default AdUnitsTable
