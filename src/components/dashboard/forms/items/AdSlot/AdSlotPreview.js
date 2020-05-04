import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Grid } from '@material-ui/core'
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
import { execute, getCategorySuggestions } from 'actions'
import {
	t,
	selectMainToken,
	selectNewAdSlot,
	selectAccountIdentityAddr,
	selectSpinnerById,
} from 'selectors'
import { GV_TARGETING_SUGGESTIONS } from 'constants/spinners'

const useStyles = makeStyles(styles)

const SlotFallback = ({ img, targetUrl }) => {
	const classes = useStyles()
	return (
		<Fragment>
			<PropRow
				left={t('fallbackAdUrl', { isProp: true })}
				right={
					<Anchor href={targetUrl} target='_blank'>
						{targetUrl}
					</Anchor>
				}
			/>
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
		</Fragment>
	)
}

const AdSlotPreview = props => {
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

	const autoTargetingSpinner = useSelector(state =>
		selectSpinnerById(state, GV_TARGETING_SUGGESTIONS)
	)
	const autoTargets = (temp.targets || [])
		.filter(i => i.auto)
		.reduce((aggr, curr) => {
			aggr.push(curr.target)
			return aggr
		}, [])

	const manualTargets = (temp.targets || [])
		.filter(i => !i.auto)
		.reduce((aggr, curr) => {
			aggr.push(curr.target)
			return aggr
		}, [])

	React.useEffect(() => {
		execute(
			getCategorySuggestions({
				itemType: 'AdSlot',
				collection: 'tags',
				validateId: props.validateId,
			})
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const identityAddr = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)

	return (
		<ContentBox>
			<ContentBody>
				<Grid container>
					<Grid item xs={12} md={6}>
						<PropRow left={t('title', { isProp: true })} right={title} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('type', { isProp: true })} right={type} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('MIN_CPM_SLOT_LABEL')}
							right={`${minPerImpression || 0} ${symbol}`}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('website', { isProp: true })} right={website} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('description', { isProp: true })}
							right={description}
						/>
					</Grid>

					<Grid item xs={12}>
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
					</Grid>

					{temp.hostname && temp.issues && temp.issues.length && (
						<Grid item xs={12}>
							<PropRow right={<WebsiteIssues issues={temp.issues} />} />
						</Grid>
					)}
					<Grid item xs={12} md={6}>
						{temp.useFallback ? (
							<SlotFallback img={temp} targetUrl={targetUrl} />
						) : (
							<PropRow left={t('FALLBACK_DATA')} right={t('NO')} />
						)}
					</Grid>

					<Grid item xs={12} md={6}>
						{/* <PropRow
							left={t('targeting', { isProp: true })}
							right={
								<Fragment>
									<TargetsList
										targets={manualTargets}
										// subHeader={'TARGETING'}
									/>
								</Fragment>
							}
						/> */}
						<PropRow
							left={t('AUTO_TARGETING')}
							right={
								<Fragment>
									{autoTargetingSpinner ? (
										t(`ANALYZING_AUTO_TARGETING`)
									) : (
										<TargetsList
											targets={autoTargets}
											// subHeader={'TARGETING'}
										/>
									)}
								</Fragment>
							}
						/>
					</Grid>
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default AdSlotPreview
