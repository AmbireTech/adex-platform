import React from 'react'
import {
	Grid,
	Card,
	CardMedia,
	TextField,
	List,
	ListItem,
	ListItemText,
	Divider,
} from '@material-ui/core'
import {
	useItem,
	DirtyProps,
	ItemTitle,
	ItemDescription,
	MediaCard,
} from 'components/dashboard/containers/ItemCommon/'
import { AdUnit } from 'adex-models'
import TargetsList from 'components/dashboard/containers/TargetsList'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { t } from 'selectors'

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
		<div>
			<DirtyProps {...hookProps} />
			<Grid container spacing={2}>
				<Grid item xs={12} sm={12} md={6} lg={5}>
					<List>
						<ListItem>
							<ListItemText
								secondary={type}
								primary={t('type', { isProp: true })}
							/>
						</ListItem>
						<MediaCard mediaUrl={mediaUrl} mediaMime={mediaMime} />

						<Divider />
						<ListItem>
							<ListItemText
								secondary={
									<Anchor href={targetUrl} target='_blank'>
										{targetUrl}
									</Anchor>
								}
								primary={t('targetUrl', { isProp: true })}
							/>
						</ListItem>
					</List>
				</Grid>
				<Grid item xs={12} sm={12} md={6} lg={7}>
					<List>
						<ListItem>
							<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
						</ListItem>
						<Divider />
						<ListItem>
							<ItemDescription
								description={description}
								errDescription={errDescription}
								{...hookProps}
							/>
						</ListItem>
						<Divider />
					</List>
					<TargetsList targets={item.targeting} subHeader={'PROP_TARGETING'} />
				</Grid>
				<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
			</Grid>
		</div>
	)
}

export default Unit
