import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { Grid, Tabs, Tab, Box } from '@material-ui/core'
import {
	useItem,
	ChangeControls,
	ItemTitle,
	ItemDescription,
	ItemAdType,
	ItemTargetURL,
	MediaCard,
	ArchiveItemBtn,
	ItemTabsContainer,
	ItemTabsBar,
} from 'components/dashboard/containers/ItemCommon/'
import { AdUnit } from 'adex-models'
import { validateAndUpdateUnit } from 'actions'
import { t } from 'selectors'

function Unit({ match }) {
	const [tabIndex, setTabIndex] = useState(0)

	const { item, ...hookProps } = useItem({
		itemType: 'AdUnit',
		match,
		objModel: AdUnit,
		validateAndUpdateFn: validateAndUpdateUnit,
	})

	const { validations } = hookProps

	const {
		id,
		title,
		archived,
		description,
		mediaUrl,
		mediaMime,
		type,
		targetUrl,
	} = item
	const { title: errTitle, description: errDescription } = validations

	if (!item) return <h1>Unit '404'</h1>

	return (
		<Fragment>
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('AD_UNIT')} />
				</Tabs>
			</ItemTabsBar>
			<ChangeControls {...hookProps} />
			<ItemTabsContainer>
				<Box p={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12} md={6} lg={5}>
							<Box py={1}>
								<MediaCard
									mediaUrl={mediaUrl}
									mediaMime={mediaMime}
									label={t('UNIT_MEDIA_IMG_LABEL')}
								/>
							</Box>
							{!archived && (
								<Box py={1}>
									<ArchiveItemBtn
										fullWidth
										itemType='AdUnit'
										itemId={id}
										title={title}
										goToTableOnSuccess
									/>
								</Box>
							)}
						</Grid>
						<Grid item xs={12} sm={12} md={6} lg={7}>
							<Box py={1}>
								<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
							</Box>
							<Box py={1}>
								<ItemDescription
									description={description}
									errDescription={errDescription}
									{...hookProps}
								/>
							</Box>
							<Box py={1}>
								<ItemAdType type={type} />
							</Box>
							<Box py={1}>
								<ItemTargetURL targetUrl={targetUrl} />
							</Box>
						</Grid>
					</Grid>
				</Box>
			</ItemTabsContainer>
		</Fragment>
	)
}

Unit.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Unit
