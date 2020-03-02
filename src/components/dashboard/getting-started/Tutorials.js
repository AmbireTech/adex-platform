import React, { Fragment } from 'react'
import { Typography } from '@material-ui/core'
import { confirmAction, execute } from 'actions'
import { t } from 'selectors'
import { ExternalAnchor } from 'components/common/anchor/'

export const createAdUnitTutorial = () => {
	const steps = []

	for (let i = 1; i <= 8; i++) {
		steps.push(`TUTORIAL_CREATE_AD_UNIT_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			cancelLabel: t('CANCEL'),
			title: t('TUTORIAL_CREATE_AD_UNIT_TITLE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					{t('TUTORIAL_CREATE_AD_UNIT_END')}
				</Fragment>
			),
		})
	)
}

export const fundAccountTutorial = () => {
	const steps = []

	for (let i = 1; i <= 4; i++) {
		steps.push(`TUTORIAL_FUND_ACC_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			cancelLabel: t('CANCEL'),
			title: t('TUTORIAL_FUND_ACC_TITLE'),
			text: (
				<Fragment>
					<Typography>{t('TUTORIAL_FUND_ACC_START')}</Typography>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_FUND_ACC_MORE_INFO', {
							args: [
								<ExternalAnchor
									href={
										'https://www.adex.network/blog/adex-integrates-ramp-networks-fiat-onramp-advertisers-can-now-pay-in-fiat/'
									}
								>
									{t('HERE')}
								</ExternalAnchor>,
							],
						})}
					</Typography>
					<Typography>{t('TUTORIAL_FUND_ACC_END')}</Typography>
				</Fragment>
			),
		})
	)
}

export const launchFirstCampaign = () => {
	const steps = []

	for (let i = 1; i <= 5; i++) {
		steps.push(`TUTORIAL_LAUNCH_CAMPAIGN_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			cancelLabel: t('CANCEL'),
			title: t('TUTORIAL_LAUNCH_CAMPAIGN_TITLE'),
			text: (
				<Fragment>
					<Typography>{t('TUTORIAL_LAUNCH_CAMPAIGN_START')}</Typography>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography>{t('TUTORIAL_LAUNCH_CAMPAIGN_END')}</Typography>
				</Fragment>
			),
		})
	)
}

export const createAdSlot = () => {
	const steps = []

	for (let i = 1; i <= 7; i++) {
		steps.push(`TUTORIAL_CREATE_AD_SLOT_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			cancelLabel: t('CANCEL'),
			title: t('TUTORIAL_CREATE_AD_SLOT_TTILE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography>{t('TUTORIAL_CREATE_AD_SLOT_END')}</Typography>
				</Fragment>
			),
		})
	)
}

export const placeAdSlot = () => {
	const steps = []

	for (let i = 1; i <= 2; i++) {
		steps.push(`TUTORIAL_PLACE_AD_SLOT_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			cancelLabel: t('CANCEL'),
			title: t('TUTORIAL_PLACE_AD_SLOT_TITLE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_PLACE_AD_SLOT_MORE_INFO')}
					</Typography>
					<Typography>
						<ExternalAnchor href={'https://html.com/tags/iframe/'}>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_1')}
						</ExternalAnchor>
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://webcusp.com/iframe-wordpress-plugins-and-tutorials/'
							}
						>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_2')}
						</ExternalAnchor>
						,
					</Typography>
				</Fragment>
			),
		})
	)
}
