import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Paper, Grid, Box } from '@material-ui/core'
import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import TargetsList from 'components/dashboard/containers/TargetsList'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import { AdSlotTargeting } from 'components/dashboard/forms/items/NewItems'
import {
	DirtyProps,
	ItemTitle,
	ItemDescription,
	ItemAdType,
	ItemFallbackMediaURL,
	MediaCard,
	ItemMinPerImpression,
	ItemWebsite,
} from 'components/dashboard/containers/ItemCommon/'
import { t, selectNewItemByTypeAndId } from 'selectors'
import {
	execute,
	updateNewItem,
	resetNewItem,
	updateSlotTargeting,
} from 'actions'
import { AdSlot } from 'adex-models'

// TODO: Targeting will be changed, but this will be used for campaigns targeting update
export const TargetingSteps = ({ updateField, itemId, ...props }) => {
	return (
		<FormSteps
			{...props}
			cancelFunction={() => execute(resetNewItem('AdSlot', itemId))}
			itemId={itemId}
			validateIdBase='new-AdUnit-'
			itemType='AdSlot'
			stepsId='new-slot-'
			steps={[
				{
					title: 'SLOT_TAGS_STEP',
					component: AdSlotTargeting,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(updateSlotTargeting({ updateField, itemId, ...props })),
				},
			]}
			itemModel={AdSlot}
		/>
	)
}

const TargetEdit = WithDialog(TargetingSteps)

const getInitialTemp = ({ temp, tags = [] }, currentTags, dirtyProps = []) => {
	const targets = dirtyProps.includes('tags')
		? currentTags
		: [...tags].map((tag, key) => ({
				key,
				collection: 'tags',
				source: 'custom',
				label: t(`TARGET_LABEL_TAGS`),
				placeholder: t(`TARGET_LABEL_TAGS`),
				target: { ...tag },
		  }))

	const newTemp = { ...temp, targets }

	return { temp: newTemp }
}

export const SlotBasic = ({ item, ...hookProps }) => {
	const {
		title,
		description,
		mediaUrl,
		mediaMime,
		type,
		targetUrl,
		website,
	} = item
	const { title: errTitle, description: errDescription } = hookProps.validations
	const { temp = {} } = useSelector(state =>
		selectNewItemByTypeAndId(state, 'AdSlot', item.id)
	)

	const onTargetingClick = () => {
		execute(
			updateNewItem(
				item,
				getInitialTemp(item, temp.targets, hookProps.dirtyProps),
				'AdSlot',
				AdSlot,
				item.id
			)
		)
	}

	return (
		<Fragment>
			<DirtyProps {...hookProps} />
			<Paper elevation={2}>
				<Box p={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12} md={6} lg={5}>
							<Box py={1}>
								<MediaCard
									mediaUrl={mediaUrl}
									mediaMime={mediaMime}
									label={t('SLOT_FALLBACK_MEDIA_LABEL')}
								/>
							</Box>
							<Box py={1}>
								<ItemFallbackMediaURL targetUrl={targetUrl} />
							</Box>
							<Box py={1}>
								<TargetEdit
									btnLabel='UPDATE_TAGS'
									title='UPDATE_SLOT_TAGS'
									itemId={item.id}
									disableBackdropClick
									updateField={hookProps.updateField}
									onClick={onTargetingClick}
								/>
								<TargetsList targets={item.tags} subHeader={'PROP_TAGS'} />
							</Box>
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
							<Grid container spacing={2}>
								<Grid item xs={12} sm={12} md={6}>
									<Box py={1}>
										<ItemAdType type={type} />
									</Box>
								</Grid>
								<Grid item xs={12} sm={12} md={6}>
									<Box py={1}>
										<ItemMinPerImpression item={item} {...hookProps} />
									</Box>
								</Grid>
							</Grid>
							<Box py={1}>
								<ItemWebsite item={item} {...hookProps} />
							</Box>
							<Box>
								<WebsiteIssues website={website} />
							</Box>
						</Grid>
						<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
					</Grid>
				</Box>
			</Paper>
		</Fragment>
	)
}
