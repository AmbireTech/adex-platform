import React, { Fragment } from 'react'
import { Typography } from '@material-ui/core'
import { confirmAction, execute } from 'actions'
import { t } from 'selectors'
import Anchor from 'components/common/anchor/anchor'
import { OpenInNew } from '@material-ui/icons'

const ExternalAnchor = ({ href, children }) => (
	<Anchor
		style={{ fontWeight: 'bold' }}
		underline='always'
		target='_blank'
		color='primary'
		href={href}
	>
		{children} <OpenInNew fontSizeAdjust fontSize='inherit' />
	</Anchor>
)

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
							<li>{t(step, { components: [<strong />] })}</li>
						))}
					</ol>
					{t('TUTORIAL_CREATE_AD_UNIT_END', {
						components: [<strong />],
					})}
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
							<li>{t(step, { components: [<strong />] })}</li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_FUND_ACC_MORE_INFO', {
							components: [
								<ExternalAnchor
									href={
										'https://www.adex.network/blog/adex-integrates-ramp-networks-fiat-onramp-advertisers-can-now-pay-in-fiat/'
									}
								/>,
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
							<li>
								{t(step, {
									components: [
										<strong />, //
										<strong />,
									],
								})}
							</li>
						))}
					</ol>
					<Typography>
						{t('TUTORIAL_LAUNCH_CAMPAIGN_END', { components: [<strong />] })}
					</Typography>
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
							<li>
								{t(step, {
									components: [
										<strong />, //
										<strong />,
									],
								})}
							</li>
						))}
					</ol>
					<Typography>
						{t('TUTORIAL_CREATE_AD_SLOT_END', { components: [<strong />] })}
					</Typography>
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
							<li>
								{t(step, {
									components: [
										<strong />, //
										<strong />,
									],
								})}
							</li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_PLACE_AD_SLOT_MORE_INFO')}
					</Typography>
					<Typography>
						{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_1', {
							components: [
								<ExternalAnchor href={'https://html.com/tags/iframe/'} />,
							],
						})}
					</Typography>
					<Typography>
						{t('TUTORIAL_PLACE_AD_SLOT_INFO_LINK_2', {
							components: [
								<ExternalAnchor
									href={
										'https://webcusp.com/iframe-wordpress-plugins-and-tutorials/'
									}
								/>,
							],
						})}
					</Typography>
				</Fragment>
			),
		})
	)
}
