import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import {
	Typography,
	Grid,
	Box,
	Accordion,
	AccordionSummary,
	Chip,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { IabCategories } from 'adex-models'
import Img from 'components/common/img/Img'
import Anchor from 'components/common/anchor/anchor'
import {
	WebsiteIssues,
	WebsiteDSNRecord,
	ALL_ISSUES,
} from 'components/dashboard/containers/Slot/WebsiteIssues'
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
	selectDemandAnalyticsByType,
} from 'selectors'

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

const AdSlotPreview = () => {
	const {
		type,
		title,
		description,
		website,
		temp,
		targetUrl,
		rules,
		rulesInput,
		minPerImpression,
	} = useSelector(selectNewAdSlot)

	const identityAddr = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)
	const typeDemand = useSelector(state =>
		selectDemandAnalyticsByType(state, type)
	)
	const { allowAdultContent, autoSetMinCPM } = rulesInput.inputs
	const { categories = [], suggestedMinCPM, hostname, issues } = temp

	const hasIssues = hostname && issues && issues.length
	const showDnsRecord =
		hasIssues &&
		issues.some(i => i === ALL_ISSUES.SLOT_ISSUE_OWNERSHIP_NOT_VERIFIED)

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
						<PropRow left={t('website', { isProp: true })} right={website} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('SLOT_MIN_CPM', { args: [symbol] })}
							right={
								autoSetMinCPM
									? t('SLOT_AUTO_MIN_CPM_PREVIEW_LABEL', {
											args: [suggestedMinCPM, symbol],
									  })
									: t('SLOT_MANUAL_MIN_CPM_PREVIEW_LABEL', {
											args: [minPerImpression, symbol],
									  })
							}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('SLOT_ALLOW_ADULT_CONTENT')}
							right={allowAdultContent ? t('YES') : t('NO')}
						/>
					</Grid>

					<Grid item xs={12} md={12}>
						<PropRow
							left={t('description', { isProp: true })}
							right={description}
						/>
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

					{(!typeDemand || !typeDemand.raw) && (
						<Grid item xs={12}>
							<PropRow
								left={t('DEMAND_WARNINGS')}
								right={
									<Alert severity='warning' variant='outlined'>
										{t('SLOT_NO_CURRENT_DEMAND', { args: [type] })}
									</Alert>
								}
							/>
						</Grid>
					)}

					{showDnsRecord && (
						<Grid item xs={12}>
							<PropRow
								left={t('WEBSITE_DNS_RECORD_LABEL')}
								right={<WebsiteDSNRecord website={website} />}
							/>
						</Grid>
					)}

					{hasIssues && (
						<Grid item xs={12}>
							<PropRow
								left={t('WEBSITE_ISSUES')}
								right={<WebsiteIssues issues={issues} />}
							/>
						</Grid>
					)}
					<Grid item xs={12} md={12}>
						{temp.useFallback ? (
							<SlotFallback img={temp} targetUrl={targetUrl} />
						) : (
							<PropRow left={t('FALLBACK_DATA')} right={t('NO')} />
						)}
					</Grid>
					<Grid item xs={12}>
						<Box p={1}>
							<Accordion square={true} variant='outlined'>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls='slot-rules-content'
									id='slot-rules-header'
								>
									<Typography>{t('SLOT_RULES')}</Typography>
								</AccordionSummary>
								<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
									<pre>{JSON.stringify(rules || [], null, 2)}</pre>
								</Box>
							</Accordion>
						</Box>
					</Grid>
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default AdSlotPreview
