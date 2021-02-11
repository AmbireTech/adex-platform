import React, { useState, useEffect } from 'react'
import { execute, resendConfirmationEmail } from 'actions'
import { SendSharp } from '@material-ui/icons'
import { Grid, Button } from '@material-ui/core'
import { t } from 'selectors'

function ResendConfirm() {
	const [timeLeft, setTimeLeft] = useState(null)

	useEffect(() => {
		if (timeLeft === 0) {
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
				{/* TODO: extract translations */}
				<Grid>Didn't receive the email or you can't find it?</Grid>
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
						Resend {timeLeft && `(wait ${timeLeft}s)`}
					</Button>
				</Grid>
			</Grid>
		</Grid>
	)
}

export default ResendConfirm
