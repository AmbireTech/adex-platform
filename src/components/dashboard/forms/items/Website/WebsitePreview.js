import React from 'react'
import { useSelector } from 'react-redux'
import { Grid, Chip } from '@material-ui/core'
import { IabCategories } from 'adex-models'

import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import {
	PropRow,
	ContentBox,
	ContentBody,
} from 'components/common/dialog/content'
import { t, selectNewWebsite } from 'selectors'

const WebsitePreview = () => {
	const { website, temp } = useSelector(selectNewWebsite)

	const { categories = [], hostname, issues } = temp
	return (
		<ContentBox>
			<ContentBody>
				<Grid container>
					<Grid item xs={12} md={12}>
						<PropRow left={t('website', { isProp: true })} right={website} />
					</Grid>

					<Grid item xs={12} md={12}>
						<PropRow
							left={t('WEBSITE_CATEGORIES')}
							right={categories.map(cat => (
								<Chip
									key={cat}
									variant='outlined'
									size='small'
									label={t(
										IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat
									)}
								/>
							))}
						/>
					</Grid>

					{hostname && issues && issues.length && (
						<Grid item xs={12}>
							<PropRow
								left={t('WEBSITE_ISSUES')}
								right={<WebsiteIssues issues={issues} />}
							/>
						</Grid>
					)}
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default WebsitePreview
