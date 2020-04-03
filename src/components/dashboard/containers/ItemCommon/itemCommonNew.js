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
	Card,
	CardMedia,
	CardContent,
	Button,
} from '@material-ui/core'
import { Info, Edit, UndoOutlined } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import Anchor from 'components/common/anchor/anchor'
import { t } from 'selectors'
import { styles } from './styles'

const useStyles = makeStyles(styles)

export const DirtyProps = ({
	dirtyProps = [],
	returnPropToInitialState,
	setActiveFields,
}) => {
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
								size='small'
								className={classes.changeChip}
								key={p}
								label={t(p, { isProp: true })}
								onDelete={() => {
									returnPropToInitialState(p)
									setActiveFields(p)
								}}
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
	returnPropToInitialState,
	activeFields,
}) => {
	const classes = useStyles()
	const active = !!activeFields.title
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
				value={title || ''}
				onChange={ev => {
					updateField('title', ev.target.value)
				}}
				maxLength={1024}
				disabled={!active}
				endAdornment={
					<InputAdornment position='end'>
						<IconButton
							// disabled
							// size='small'
							color='secondary'
							className={classes.buttonRight}
							onClick={() =>
								active
									? (returnPropToInitialState('title'),
									  setActiveFields('title', false))
									: setActiveFields('title', true)
							}
						>
							{active ? <UndoOutlined /> : <Edit />}
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
	returnPropToInitialState,
	activeFields,
}) => {
	const classes = useStyles()
	const active = !!activeFields.description
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
				rows={2}
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
							onClick={() =>
								active
									? (returnPropToInitialState('description'),
									  setActiveFields('description', false))
									: setActiveFields('description', true)
							}
						>
							{active ? <UndoOutlined /> : <Edit />}
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

export const MediaCard = ({
	mediaUrl,
	mediaMime,
	title,
	canEditImg,
	toggleImgEdit,
	url,
}) => {
	const classes = useStyles()
	return (
		<Card className={classes.card} raised={false}>
			<CardMedia classes={{ root: classes.mediaRoot }}>
				<Img
					allowFullscreen={true}
					src={mediaUrl}
					alt={title}
					className={classes.img}
					mediaMime={mediaMime}
					allowVideo
				/>
			</CardMedia>
			{canEditImg && (
				<Button
					variant='fab'
					mini
					color='secondary'
					onClick={toggleImgEdit}
					className={classes.editIcon}
				>
					<Edit />
				</Button>
			)}

			{url && (
				<CardContent>
					<Anchor href={url} target='_blank'>
						{url}
					</Anchor>
				</CardContent>
			)}
		</Card>
	)
}
