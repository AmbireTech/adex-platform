import React, { Fragment } from 'react'
import { Prompt } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import {
	Chip,
	InputAdornment,
	IconButton,
	Card,
	CardMedia,
	CardContent,
	TextField,
	Button,
} from '@material-ui/core'
import { Info, Edit, UndoOutlined, OpenInNew } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import Anchor, { ExternalAnchor } from 'components/common/anchor/anchor'
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
	const active = !!activeFields.title
	return (
		<TextField
			fullWidth
			id='item-title'
			label={t('title', { isProp: true })}
			type='text'
			name='title'
			value={title || ' '}
			onChange={ev => {
				updateField('title', ev.target.value)
			}}
			defaultValue=' '
			disabled={!active}
			error={!!titleErr && !!titleErr.errMsg}
			helperText={
				titleErr && titleErr.errMsg && titleErr.dirty
					? t(titleErr.errMsg, { args: titleErr.errMsgArgs })
					: ' '
			}
			variant='outlined'
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
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
				),
			}}
		/>
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
	const active = !!activeFields.description
	return (
		<TextField
			fullWidth
			id='item-description'
			label={t('description', { isProp: true })}
			type='text'
			name='description'
			value={description || ' '}
			onChange={ev => {
				updateField('description', ev.target.value)
			}}
			maxLength={1024}
			multiline
			rows={2}
			defaultValue=' '
			disabled={!activeFields.description}
			error={!!descriptionErr && !!descriptionErr.errMsg}
			helperText={
				descriptionErr && !!descriptionErr.errMsg
					? t(descriptionErr.errMsg, {
							args: descriptionErr.errMsgArgs,
					  })
					: ' '
			}
			variant='outlined'
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
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
				),
			}}
		/>
	)
}

export const ItemAdType = ({ type }) => {
	return (
		<TextField
			fullWidth
			id='item-type'
			label={t('type', { isProp: true })}
			type='text'
			name='type'
			value={type || ' '}
			disabled={true}
			variant='outlined'
		/>
	)
}

export const ItemTargetURL = ({ targetUrl = '' }) => {
	return (
		<TextField
			fullWidth
			id='item-targetUrl'
			label={t('targetUrl', { isProp: true })}
			type='text'
			name='targetUrl'
			value={targetUrl}
			disabled={true}
			variant='outlined'
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<ExternalAnchor
							color='primary'
							href={targetUrl}
							component={props => (
								<IconButton {...props}>
									<OpenInNew />
								</IconButton>
							)}
						/>
					</InputAdornment>
				),
			}}
		/>
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
