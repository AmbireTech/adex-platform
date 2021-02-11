import React, { useState, useEffect } from 'react'
import { execute, resendConfirmationEmail } from 'actions'
import { SendSharp } from '@material-ui/icons'
import { Grid, Button } from '@material-ui/core'
import { selectResendConfirmation, t } from 'selectors'
import { useSelector } from 'react-redux'

function ResendConfirm() {
	const { lastEmailResent } = useSelector(state =>
		selectResendConfirmation(state)
	)
	const lastEmailResentTs = lastEmailResent ? +new Date(lastEmailResent) : 0
	const waitInSeconds = Math.ceil(
		(lastEmailResentTs + 60 * 1000 - Date.now()) / 1000
	)
	const [timeLeft, setTimeLeft] = useState(waitInSeconds)

	useEffect(() => {
		if (timeLeft <= 0) {
			setTimeLeft(null)
		}

		// exit early when we reach 0
		if (!timeLeft) return

		// save intervalId to clear the interval when the
		// component re-renders
		const intervalId = setInterval(() => {
			setTimeLeft(timeLeft - 1)
		}, 1000)

		// clear interval on re-render to avoid memory leaks
		return () => clearInterval(intervalId)
		// add timeLeft as a dependency to re-rerun the effect
		// when we update it
	}, [timeLeft])
	return (
		<Grid container>
			<Grid lg={12}>
				<span
					dangerouslySetInnerHTML={{
						__html: t('TUTORIAL_CONFIRM_EMAIL_CONTENT'),
					}}
				/>
			</Grid>
			<Grid container lg={12} alignItems='center'>
				<Grid>{t('GETTING_STARTED_DID_NOT_RECEIVE_QUESTION')}</Grid>
				<Grid>
					<Button
						onClick={() => {
							execute(resendConfirmationEmail())
							setTimeLeft(60)
						}}
						disabled={timeLeft}
						endIcon={<SendSharp />}
						size='small'
					>
						{t('RESEND')} {timeLeft && t('WAIT_TIME', { args: [timeLeft] })}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	)
}

export default ResendConfirm
