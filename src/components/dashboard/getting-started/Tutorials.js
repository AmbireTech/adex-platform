import React, { Fragment } from 'react'
import { Typography } from '@material-ui/core'
import { confirmAction, execute } from 'actions'
import { t } from 'selectors'
import Anchor from 'components/common/anchor/anchor'

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
							<li>{t(step)}</li>
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
							<li>{t(step)}</li>
						))}
					</ol>
					<Typography gutterBottom>
						{t('TUTORIAL_FUND_ACC_MORE_INFO', {
							components: [
								<Anchor
									underline='always'
									color='primary'
									href={'http://google.com'}
								></Anchor>,
							],
						})}
					</Typography>
					<Typography>{t('TUTORIAL_FUND_ACC_END')}</Typography>
				</Fragment>
			),
		})
	)
}
