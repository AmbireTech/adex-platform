import React, { Fragment } from 'react'
import { Tooltip, Button, ButtonGroup } from '@material-ui/core'
import { EditSharp, VisibilitySharp as Visibility } from '@material-ui/icons'
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
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
import { execute, updateNewCampaign } from 'actions'

const useStyles = makeStyles(styles)
const RRIconButton = withReactRouterLink(Button)

const getCols = ({ classes, symbol }) => [
	{
		name: 'id',
		label: t('PROP_ID'),
		options: {
			filter: false,
			sort: false,
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: false,
			customBodyRender: ({ id, audienceInput, to }) => (
				<Fragment key={id}>
					<Tooltip
						title={t('LABEL_EDIT')}
						// placement='top'
						enterDelay={1000}
						aria-label='view'
					>
						<Button
							// startIcon={<EditSharp />}
							variant='contained'
						>
							{t('EDIT')}
						</Button>
					</Tooltip>
					<Tooltip
						title={t('LABEL_NEW_CAMPAIGN')}
						// placement='top'
						enterDelay={1000}
						aria-label='view'
					>
						<Tooltip
							title={t('NEW_CAMPAIGN_FROM_AUDIENCE')}
							// placement='top'
							enterDelay={1000}
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
									icon={<CampaignIcon />}
									iconButton
								/>
							</span>
						</Tooltip>
					</Tooltip>
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton to={to} variant='contained' aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
				</Fragment>
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
	const classes = useStyles()
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
				classes,
				symbol,
			}),
	})

	const options = getOptions({ reloadData })

	return (
		<MUIDataTableEnhanced
			title={t('ALL_AUDIENCES')}
			data={data}
			columns={columns}
			options={options}
			loading={!itemsLoaded}
			{...props}
		/>
	)
}

export default AudiencesTable
