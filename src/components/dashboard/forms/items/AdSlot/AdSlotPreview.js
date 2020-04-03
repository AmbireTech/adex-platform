import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import Img from 'components/common/img/Img'
import TargetsList from 'components/dashboard/containers/TargetsList'
import Anchor from 'components/common/anchor/anchor'
import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import {
	PropRow,
	ContentBox,
	ContentBody,
} from 'components/common/dialog/content'
import { styles } from '../styles'
import {
	t,
	selectMainToken,
	selectNewAdSlot,
	selectAccountIdentityAddr,
} from 'selectors'

const useStyles = makeStyles(styles)

const SlotFallback = ({ img, targetUrl }) => {
	const classes = useStyles()
	return (
		<div>
			<PropRow
				left={t('SLOT_FALLBACK_IMG_LABEL')}
				right={
					<Img
						allowFullscreen={true}
						classes={{
							img: classes.imgPreview,
							wrapper: classes.imgPreviewWrapper,
						}}
						src={img.tempUrl || ''}
						alt={targetUrl}
						mediaMime={img.mime}
						allowVideo
					/>
				}
			/>
			<PropRow
				left={t('fallbackAdUrl', { isProp: true })}
				right={
					<Anchor href={targetUrl} target='_blank'>
						{targetUrl}
					</Anchor>
				}
			/>
		</div>
	)
}

const AdSlotPreview = () => {
	const {
		type,
		title,
		description,
		website,
		temp,
		tags,
		targetUrl,
		minPerImpression,
	} = useSelector(selectNewAdSlot)

	const identityAddr = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)

	return (
		<ContentBox>
			<ContentBody>
				<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
				<PropRow left={t('type', { isProp: true })} right={type} />
				<PropRow left={t('title', { isProp: true })} right={title} />
				<PropRow
					left={t('description', { isProp: true })}
					right={description}
				/>
				<PropRow left={t('website', { isProp: true })} right={website} />
				<PropRow
					right={
						<Fragment>
							<Typography component='div' color='primary' gutterBottom>
								<div
									dangerouslySetInnerHTML={{
										__html: t('SLOT_WEBSITE_WARNING'),
									}}
								/>
							</Typography>
							<Typography component='div' color='primary' gutterBottom>
								<div
									dangerouslySetInnerHTML={{
										__html: t('SLOT_WEBSITE_CODE_WARNING'),
									}}
								/>
							</Typography>
						</Fragment>
					}
				/>
				{temp.hostname && temp.issues && temp.issues.length && (
					<PropRow right={<WebsiteIssues issues={temp.issues} />} />
				)}

				<PropRow
					left={t('MIN_CPM_SLOT_LABEL')}
					right={`${minPerImpression} ${symbol}`}
				/>
				{temp.useFallback && <SlotFallback img={temp} targetUrl={targetUrl} />}
				{/* </Grid> */}
				<br />
				{tags && (
					<PropRow
						left={t('tags', { isProp: true })}
						right={<TargetsList targets={tags} />}
					/>
				)}
			</ContentBody>
		</ContentBox>
	)
}

export default AdSlotPreview
