import React, { Fragment } from 'react'
import { Paper, Grid, Box } from '@material-ui/core'
import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import TargetsList from 'components/dashboard/containers/TargetsList'
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

	return (
		<Fragment>
			<DirtyProps {...hookProps} />
			<Paper elevation={2}>
				<Box p={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12} md={6} lg={5}>
							<Box py={1}>
								<MediaCard mediaUrl={mediaUrl} mediaMime={mediaMime} />
							</Box>
							<Box py={1}>
								<ItemFallbackMediaURL targetUrl={targetUrl} />
							</Box>
							<Box py={1}>
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
