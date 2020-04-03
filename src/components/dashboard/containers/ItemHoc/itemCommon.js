import React, { Fragment } from 'react'
import { Prompt } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import {
	Chip,
	FormControl,
	FormHelperText,
	InputLabel,
	Input,
	InputAdornment,
	IconButton,
} from '@material-ui/core'
import { Info, Edit } from '@material-ui/icons'
import { t } from 'selectors'
import { styles } from './styles'

const useStyles = makeStyles(styles)

export const DirtyProps = ({ dirtyProps = [], returnPropToInitialState }) => {
	const classes = useStyles()

	return (
		<Fragment>
			<Prompt when={!!dirtyProps.length} message={t('UNSAVED_CHANGES_ALERT')} />
			{!!dirtyProps.length && (
				<div className={classes.changesLine}>
					<Info className={classes.buttonLeft} />
					<span className={classes.buttonLeft}>{t('UNSAVED_CHANGES')}:</span>
					{dirtyProps.map(p => {
						return (
							<Chip
								className={classes.changeChip}
								key={p}
								label={t(p, { isProp: true })}
								onDelete={() => this.returnPropToInitialState(p)}
							/>
						)
					})}
				</div>
			)}
		</Fragment>
	)
}

export const ItemTitle = ({
	title,
	titleErr,
	updateField,
	setActiveFields = {},
	activeFields,
}) => {
	const classes = useStyles()
	return (
		<FormControl
			fullWidth
			className={classes.textField}
			margin='dense'
			error={!!titleErr && !!titleErr.errMsg}
		>
			<InputLabel>{t('title', { isProp: true })}</InputLabel>
			<Input
				fullWidth
				autoFocus
				type='text'
				name={t('title', { isProp: true })}
				value={title}
				onChange={ev => {
					updateField('title', ev.target.value)
				}}
				maxLength={1024}
				onBlur={ev => {
					setActiveFields('title', false)
				}}
				disabled={!activeFields.title}
				endAdornment={
					<InputAdornment position='end'>
						<IconButton
							// disabled
							// size='small'
							color='secondary'
							className={classes.buttonRight}
							onClick={ev => setActiveFields('title', true)}
						>
							<Edit />
						</IconButton>
					</InputAdornment>
				}
			/>
			{titleErr && titleErr.errMsg && titleErr.dirty && (
				<FormHelperText>
					{t(titleErr.errMsg, { args: titleErr.errMsgArgs })}
				</FormHelperText>
			)}
		</FormControl>
	)
}

export const ItemDescription = ({
	description,
	descriptionErr,
	updateField,
	setActiveFields = {},
	activeFields,
}) => {
	const classes = useStyles()
	return (
		<FormControl
			margin='dense'
			fullWidth
			className={classes.textField}
			error={!!descriptionErr && !!descriptionErr.errMsg}
		>
			<InputLabel htmlFor='description'>
				{t('description', { isProp: true })}
			</InputLabel>
			<Input
				fullWidth
				autoFocus
				multiline
				rows={3}
				type='text'
				name='description'
				value={description || ''}
				onChange={ev => {
					updateField('description', ev.target.value)
				}}
				maxLength={1024}
				disabled={!activeFields.description}
				endAdornment={
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
							className={classes.buttonRight}
							onClick={ev => setActiveFields('description', true)}
						>
							<Edit />
						</IconButton>
					</InputAdornment>
				}
			/>
			{descriptionErr && !!descriptionErr.errMsg ? (
				<FormHelperText>
					{t(descriptionErr.errMsg, {
						args: descriptionErr.errMsgArgs,
					})}
				</FormHelperText>
			) : (
				!description && (
					<FormHelperText>{t('NO_DESCRIPTION_YET')}</FormHelperText>
				)
			)}
		</FormControl>
	)
}
