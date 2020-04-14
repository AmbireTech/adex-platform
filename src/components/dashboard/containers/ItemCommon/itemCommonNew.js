import React, { Fragment, forwardRef } from 'react'
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
import { formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { t, selectMainToken } from 'selectors'
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
								size='small'
								className={classes.changeChip}
								key={p}
								label={t(p, { isProp: true })}
								onDelete={() => {
									returnPropToInitialState(p)
								}}
							/>
						)
					})}
				</div>
			)}
		</Fragment>
	)
}

export const ItemSpecProp = ({
	prop,
	label,
	value = '',
	helperText,
	InputProps,
}) => {
	return (
		<TextField
			fullWidth
			id={prop}
			label={label}
			type='text'
			margin='dense'
			name={prop}
			value={value || ''}
			disabled
			helperText={helperText}
			variant='outlined'
			InputProps={InputProps}
		/>
	)
}

export const ItemTitle = ({
	title,
	errTitle,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const active = !!activeFields.title
	const showError = !!errTitle && errTitle.dirty
	return (
		<TextField
			fullWidth
			id='item-title'
			label={t('title', { isProp: true })}
			type='text'
			name='title'
			value={title || ''}
			onChange={ev => {
				updateField('title', ev.target.value)
			}}
			disabled={!active}
			error={showError}
			helperText={
				showError ? t(errTitle.errMsg, { args: errTitle.errMsgArgs }) : ''
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
									? returnPropToInitialState('title')
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
	errDescription,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const active = !!activeFields.description
	const showError = !!errDescription && errDescription.dirty
	return (
		<TextField
			fullWidth
			id='item-description'
			label={t('description', { isProp: true })}
			type='text'
			name='description'
			value={description || ''}
			onChange={ev => {
				updateField('description', ev.target.value)
			}}
			maxLength={1024}
			multiline
			rows={2}
			disabled={!activeFields.description}
			error={showError}
			helperText={
				showError
					? t(errDescription.errMsg, {
							args: errDescription.errMsgArgs,
					  })
					: ''
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
									? returnPropToInitialState('description')
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
			value={type || ''}
			disabled={true}
			variant='outlined'
		/>
	)
}

const OpenInNewIconBtn = ({ forwardedRef, ...props }) => {
	return (
		<IconButton {...props}>
			<OpenInNew />
		</IconButton>
	)
}

const IconButtonWithRef = forwardRef((props, ref) => (
	<OpenInNewIconBtn {...props} forwardedRef={ref} />
))

export const ItemTargetURL = ({ targetUrl = '', label }) => {
	return (
		<TextField
			fullWidth
			id='item-targetUrl'
			label={t(label || 'PROP_TARGETURL')}
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
							component={IconButtonWithRef}
						/>
					</InputAdornment>
				),
			}}
		/>
	)
}

export const ItemFallbackMediaURL = ({ targetUrl = '' }) => {
	// TODO: need to take it from fallbackUnit
	return (
		<TextField
			fullWidth
			id='item-targetUrl'
			label={t('PROP_FALLBACKADURL')}
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
							component={IconButtonWithRef}
						/>
					</InputAdornment>
				),
			}}
		/>
	)
}

export const MediaCard = ({ mediaUrl = '', mediaMime = '', label = '' }) => {
	const classes = useStyles()
	return (
		<Card className={classes.card} raised={false}>
			<CardMedia classes={{ root: classes.mediaRoot }}>
				<Img
					allowFullscreen={true}
					src={mediaUrl}
					alt={label || t('MEDIA')}
					className={classes.img}
					mediaMime={mediaMime}
					allowVideo
				/>
				{label && (
					<Chip size='small' className={classes.mediaPropChip} label={label} />
				)}
			</CardMedia>
		</Card>
	)
}

export const ItemMinPerImpression = ({
	item = {},
	validations,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const { address, decimals, symbol } = selectMainToken()
	const { minPerImpression } = item
	const active = !!activeFields.minPerImpression
	const { minPerImpression: error } = validations
	const showError = !!error && error.dirty
	const minCPM =
		typeof minPerImpression === 'object'
			? formatTokenAmount(
					bigNumberify((item.minPerImpression || {})[address] || '0').mul(1000),
					decimals,
					true
			  )
			: minPerImpression

	return (
		<TextField
			fullWidth
			id='item-minPerImpression'
			label={t('MIN_CPM_SLOT_LABEL', { args: [symbol] })}
			type='text'
			name='minPerImpression'
			value={minCPM || ''}
			onChange={ev => {
				updateField('minPerImpression', ev.target.value.trim())
			}}
			disabled={!active}
			error={showError}
			helperText={showError ? t(error.errMsg, { args: error.errMsgArgs }) : ' '}
			variant='outlined'
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
							onClick={() =>
								active
									? returnPropToInitialState('minPerImpression')
									: setActiveFields('minPerImpression', true)
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

export const ItemWebsite = ({
	item = {},
	validations,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const { website } = item
	const active = !!activeFields.website
	const { website: error } = validations
	const showError = !!error && error.dirty

	return (
		<TextField
			fullWidth
			id='item-website'
			label={t('SLOT_WEBSITE')}
			type='text'
			name='website'
			value={website || ' '}
			onChange={ev => {
				updateField('website', ev.target.value)
			}}
			disabled={!active}
			error={showError}
			helperText={
				showError && activeFields.website ? (
					t(error.errMsg, { args: error.errMsgArgs })
				) : (
					<Fragment>
						{activeFields.website && (
							<span
								dangerouslySetInnerHTML={{
									__html: t('SLOT_MIN_CPM_HELPER'),
								}}
							/>
						)}
						<span
							dangerouslySetInnerHTML={{
								__html: t('SLOT_WEBSITE_CODE_WARNING'),
							}}
						/>
					</Fragment>
				)
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
									? returnPropToInitialState('website')
									: setActiveFields('website', true)
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
