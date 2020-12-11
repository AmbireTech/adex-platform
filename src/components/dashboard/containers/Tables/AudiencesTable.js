import React from 'react'
import { Tooltip, IconButton, Typography, Box } from '@material-ui/core'
import { VisibilitySharp as Visibility } from '@material-ui/icons'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import { NewCampaignFromAudience } from 'components/dashboard/forms/items/NewItems'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import {
	t,
	selectSide,
	selectAudiencesTableData,
	selectMainToken,
	selectInitialDataLoadedByData,
} from 'selectors'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { ArchiveItemBtn } from 'components/dashboard/containers/ItemCommon'
import { useSelector } from 'react-redux'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import { execute, updateNewCampaign } from 'actions'
import { formatDate } from 'helpers/formatters'

const RRIconButton = withReactRouterLink(IconButton)
const RRTypography = withReactRouterLink(Typography)

const getCols = ({ symbol }) => [
	{
		name: 'title',
		label: t('PROP_TITLE'),
		options: {
			filter: false,
			sort: false,
			setCellProps: () => ({ style: { cursor: 'pointer' } }),
			customBodyRender: ({ title, to }) => (
				<RRTypography key={title} to={to}>
					{title}
				</RRTypography>
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
			customBodyRender: created => formatDate(created),
		},
	},
	{
		name: 'updated',
		label: t('PROP_UPDATED'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: created => formatDate(created, undefined, t('-')),
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: false,
			setCellHeaderProps: () => ({ style: { textAlign: 'right' } }),
			setCellProps: () => ({ style: { textAlign: 'right' } }),
			customBodyRender: ({ id, audienceInput, to, title }) => (
				<Box key={id}>
					<Tooltip arrow title={t('LABEL_VIEW')} aria-label='view'>
						<RRIconButton to={to} aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					<Tooltip
						arrow
						title={t('LABEL_NEW_CAMPAIGN_FROM_AUDIENCE')}
						aria-label='new-campaign'
					>
						<span>
							<NewCampaignFromAudience
								onBeforeOpen={() =>
									execute(
										updateNewCampaign('audienceInput', {
											...audienceInput,
										})
									)
								}
								icon={<CampaignIcon color='secondary' />}
								iconButton
							/>
						</span>
					</Tooltip>
					<ArchiveItemBtn
						itemType='Audience'
						itemId={id}
						title={title}
						isIconBtn
					/>
				</Box>
			),
		},
	},
]

const getOptions = ({ reloadData }) => ({
	filterType: 'multiselect',
	selectableRows: 'none',
	customToolbar: () => <ReloadData handleReload={reloadData} />,
})

function AudiencesTable(props) {
	const side = useSelector(selectSide)
	const { symbol } = useSelector(selectMainToken)
	const itemsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'allItems')
	)

	const { data, columns, reloadData } = useTableData({
		selector: selectAudiencesTableData,
		selectorArgs: side,
		getColumns: () =>
			getCols({
				symbol,
			}),
	})

	const options = getOptions({ reloadData })

	return (
		<MUIDataTableEnhanced
			title={t('SAVED_AUDIENCES')}
			data={data}
			columns={columns}
			options={options}
			loading={!itemsLoaded}
			{...props}
		/>
	)
}

export default AudiencesTable
