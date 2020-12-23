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
			title: t('TUTORIAL_CREATE_AD_UNIT_TITLE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography
						dangerouslySetInnerHTML={{
							__html: t('TUTORIAL_CREATE_AD_UNIT_END'),
						}}
					/>
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
			title: t('TUTORIAL_LAUNCH_CAMPAIGN_TITLE'),
			text: (
				<Fragment>
					<Typography>{t('TUTORIAL_LAUNCH_CAMPAIGN_START')}</Typography>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography
						dangerouslySetInnerHTML={{
							__html: t('TUTORIAL_LAUNCH_CAMPAIGN_END'),
						}}
					/>
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
			title: t('TUTORIAL_CREATE_AD_SLOT_TTILE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography
						dangerouslySetInnerHTML={{
							__html: t('TUTORIAL_CREATE_AD_SLOT_END'),
						}}
					/>
				</Fragment>
			),
		})
	)
}

export const verifyWebsite = () => {
	const steps = []

	for (let i = 1; i <= 2; i++) {
		steps.push(`TUTORIAL_VERIFY_WEBSITE_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			title: t('TUTORIAL_VERIFY_WEBSITE_TITLE'),
			text: (
				<Fragment>
					<ol>
						{steps.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_VERIFY_WEBSITE_MORE_INFO')}
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360013352340-How-to-verify-your-publisher-website'
							}
						>
							{t('TUTORIAL_VERIFY_WEBSITE_INFO_LINK_1')}
						</ExternalAnchor>
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360012481519-How-to-add-DNS-TXT-record-for-your-publisher-domain'
							}
						>
							{t('TUTORIAL_VERIFY_WEBSITE_INFO_LINK_2')}
						</ExternalAnchor>
						,
					</Typography>
				</Fragment>
			),
		})
	)
}

export const placeAdSlot = () => {
	const stepsPlace = []
	const stepsIntegrate = []

	for (let i = 1; i <= 4; i++) {
		stepsPlace.push(`TUTORIAL_PLACE_AD_SLOT_STEP_${i}`)
	}

	for (let i = 5; i <= 6; i++) {
		stepsIntegrate.push(`TUTORIAL_PLACE_AD_SLOT_STEP_${i}`)
	}
	return execute(
		confirmAction(null, null, {
			confirmLabel: t('OK'),
			title: t('TUTORIAL_PLACE_AD_SLOT_TITLE'),
			text: (
				<Fragment>
					<Typography gutterBottom>
						{t('TUTORIAL_PLACE_AD_SLOT_PLACE')}
					</Typography>
					<ol>
						{stepsPlace.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>

					<Typography gutterBottom>
						{t('TUTORIAL_PLACE_AD_SLOT_INTEGRATE')}
					</Typography>

					<ol>
						{stepsPlace.map(step => (
							<li dangerouslySetInnerHTML={{ __html: t(step) }}></li>
						))}
					</ol>

					<Typography gutterBottom>
						{t('TUTORIAL_PLACE_AD_SLOT_MORE_INFO')}
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360011670479-How-to-Create-Publisher-Ad-Slots'
							}
						>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_1')}
						</ExternalAnchor>
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360012022820-How-to-implement-an-ad-slot-to-your-website'
							}
						>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_2')}
						</ExternalAnchor>
					</Typography>
					<Typography>
						<ExternalAnchor href={'https://html.com/tags/iframe/'}>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_3')}
						</ExternalAnchor>
					</Typography>
					<Typography>
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360013148720-How-to-integrate-AdEx-ads-on-a-WordPress-site'
							}
						>
							{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_4')}
						</ExternalAnchor>
					</Typography>
				</Fragment>
			),
		})
	)
}
