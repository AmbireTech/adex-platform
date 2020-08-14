import React, { Fragment } from 'react'
import {
	Grid,
	Box,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
} from '@material-ui/core'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'

import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { SlotEdits, SlotAdvancedRules } from './SlotEdits'
import {
	ItemTitle,
	ItemDescription,
	ItemAdType,
	ItemFallbackMediaURL,
	MediaCard,
	ItemWebsite,
	ArchiveItemBtn,
} from 'components/dashboard/containers/ItemCommon/'
import { t } from 'selectors'

export const SlotBasic = ({ item, ...hookProps }) => {
	const {
		id,
		title,
		description,
		mediaUrl,
		mediaMime,
		type,
		targetUrl,
		website,
		archived,
		rules,
	} = item
	const { title: errTitle, description: errDescription } = hookProps.validations

	return (
		<Fragment>
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
							<SlotEdits item={item} {...hookProps} />
						</Box>
						{!archived && (
							<Box py={1}>
								<ArchiveItemBtn
									fullWidth
									itemType='AdSlot'
									itemId={id}
									title={title}
									goToTableOnSuccess
								/>
							</Box>
						)}
						<Box py={1}>
							<ExpansionPanel square={true} variant='outlined'>
								<ExpansionPanelSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls='slot-rules-advanced'
									id='slot-rules-advanced'
								>
									<Typography>{t('SLOT_ADVANCED')}</Typography>
								</ExpansionPanelSummary>
								<Box p={1}>
									<SlotAdvancedRules item={item} {...hookProps} />
								</Box>
							</ExpansionPanel>
						</Box>
						<Box py={1}>
							<ExpansionPanel square={true} variant='outlined'>
								<ExpansionPanelSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls='slot-rules-content'
									id='slot-rules-header'
								>
									<Typography>{t('SLOT_RULES')}</Typography>
								</ExpansionPanelSummary>
								<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
									<pre>{JSON.stringify(rules || [], null, 2)}</pre>
								</Box>
							</ExpansionPanel>
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
						<Box py={1}>
							<ItemAdType type={type} />
						</Box>

						<Box py={1}>
							<ItemWebsite item={item} {...hookProps} />
						</Box>
						<Box>
							<OutlinedPropView
								label={t('WEBSITE_VERIFICATION')}
								value={<WebsiteIssues website={website} tryAgainBtn />}
							/>
						</Box>
					</Grid>
					<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
				</Grid>
			</Box>
		</Fragment>
	)
}
