import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { t, selectIdentity, selectValidationsById } from 'selectors'
import { execute, onUploadLocalWallet, updateIdentity } from 'actions'

const useStyles = makeStyles(styles)

const QuickRecover = ({ validateId }) => {
	const identity = useSelector(selectIdentity)
	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)
	const classes = useStyles()
	const { uploadedLocalWallet } = identity
	const emailErr = validations.email

	return (
		<Grid container spacing={2} alignContent='flex-start' alignItems='center'>
			<Grid item xs={12}>
				<TextField
					fullWidth
					type='text'
					required
					label={t('email', { isProp: true })}
					name='email'
					value={identity.email || ''}
					onChange={ev => execute(updateIdentity('email', ev.target.value))}
					error={emailErr && !!emailErr.dirty}
					maxLength={128}
					helperText={
						emailErr && !!emailErr.dirty
							? emailErr.errMsg
							: t('ENTER_VALID_EMAIL')
					}
				/>
			</Grid>
			{uploadedLocalWallet && (
				<Typography paragraph variant='subheading'>
					{t('UPLOADED_WALLET_KEY', { args: [uploadedLocalWallet] })}
					{' ' + uploadedLocalWallet}
				</Typography>
			)}
			<Grid item xs={12}>
				<input
					accept='text/json'
					className={classes.input}
					id='contained-button-file'
					type='file'
					onChange={ev => execute(onUploadLocalWallet(ev))}
				/>
				<label htmlFor='contained-button-file'>
					<Button component='span' className={classes.button}>
						{t('UPLOAD_ACCOUNT_DATA_JSON')}
					</Button>
				</label>
			</Grid>
		</Grid>
	)
}

export default QuickRecover
