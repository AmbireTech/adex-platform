import React from 'react'
import { Grid, Paper, Box } from '@material-ui/core'
import {
	useItem,
	DirtyProps,
	ItemTitle,
	ItemDescription,
	ItemAdType,
	ItemTargetURL,
	MediaCard,
} from 'components/dashboard/containers/ItemCommon/'
import { AdUnit } from 'adex-models'
import TargetsList from 'components/dashboard/containers/TargetsList'

function Unit({ match }) {
	const { item, validations, ...hookProps } = useItem({
		itemType: 'AdUnit',
		match,
		objModel: AdUnit,
	})

	const { title, description, mediaUrl, mediaMime, type, targetUrl } = item
	const { title: errTitle, description: errDescription } = validations

	if (!item) return <h1>Unit '404'</h1>

	return (
		<Paper>
			<Box p={2}>
				<DirtyProps {...hookProps} />
				<Grid container spacing={2}>
					<Grid item xs={12} sm={12} md={6} lg={5}>
						<Box py={1}>
							<MediaCard mediaUrl={mediaUrl} mediaMime={mediaMime} />
						</Box>
						<Box py={1}>
							<ItemAdType type={type} />
						</Box>
						<Box py={1}>
							<ItemTargetURL targetUrl={targetUrl} />
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
							<TargetsList
								targets={item.targeting}
								subHeader={'PROP_TARGETING'}
							/>
						</Box>
					</Grid>
					<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
				</Grid>
			</Box>
		</Paper>
	)
}

export default Unit
