import React, { Fragment, forwardRef } from 'react'
import { useSelector } from 'react-redux'
import { Prompt } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import {
	Chip,
	InputAdornment,
	IconButton,
	Tooltip,
	Card,
	CardMedia,
	TextField,
	Box,
	Paper,
	Collapse,
	Button,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	Checkbox,
	Grid,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import {
	Info,
	Edit,
	UndoOutlined,
	OpenInNew,
	ArchiveSharp as ArchiveIcon,
} from '@material-ui/icons'
import Img from 'components/common/img/Img'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { t, selectMainToken, selectAuthType } from 'selectors'
import {
	execute,
	confirmAction,
	archiveItem,
	validateNumberString,
} from 'actions'
import { styles } from './styles'
import { SaveBtn } from './SaveBtn'
import { WALLET_ACTIONS_MSGS } from 'constants/misc'

const useStyles = makeStyles(styles)

export const DirtyProps = ({ dirtyProps = [], returnPropToInitialState }) => {
	const classes = useStyles()

	return (
		<Fragment>
			<Prompt when={!!dirtyProps.length} message={t('UNSAVED_CHANGES_ALERT')} />
			{!!dirtyProps.length && (
				<Box
					display='flex'
					flexGrow={1}
					flexDirection='row'
					alignItems='center'
					justifyContent='flex-start'
					flexWrap='wrap'
					mr={1}
				>
					<Info color='secondary' className={classes.changeChip} />
					<span className={classes.changeChip}>{t('UNSAVED_CHANGES')}:</span>
					{dirtyProps.map(p => {
						return (
							<Chip
								variant='outlined'
								size='small'
								color='secondary'
								className={classes.changeChip}
								key={p.name || p}
								label={t(p.name || p, { isProp: true })}
								onDelete={() => {
									returnPropToInitialState(p)
								}}
								deleteIcon={<UndoOutlined />}
							/>
						)
					})}
				</Box>
			)}
		</Fragment>
	)
}

export const ChangeControls = hookProps => {
	const classes = useStyles()
	const authType = useSelector(selectAuthType)

	return (
		<div className={classes.changeControls}>
			<Collapse timeout={69} in={!!hookProps.dirtyProps.length}>
				<Paper variant='outlined' className={classes.changeControlsPaper}>
					<Box
						display='flex'
						flexDirection='row'
						alignItems='center'
						justifyContent='space-between'
						p={1}
					>
						<DirtyProps {...hookProps} />
						<SaveBtn {...hookProps} />
					</Box>
				</Paper>
				{hookProps.spinner && hookProps.dirtyProps.includes('audienceInput') && (
					<Box>
						{WALLET_ACTIONS_MSGS[authType || 'default'].map((msg, i) => (
							<Box my={1} key={msg.message + i}>
								<Alert key={i} severity='info' variant='outlined'>
									{t(msg.message)}
								</Alert>
							</Box>
						))}
					</Box>
				)}
			</Collapse>
		</div>
	)
}

export const ItemTabsContainer = ({ children }) => {
	const classes = useStyles()

	return (
		<Paper className={classes.itemTabsContainer} variant='outlined'>
			{children}
		</Paper>
	)
}

export const ItemTabsBar = ({ children }) => {
	const classes = useStyles()

	return (
		<Paper className={classes.itemTabsBar} variant='outlined'>
			{children}
		</Paper>
	)
}

export const ItemSpecProp = ({
	prop,
	label,
	value = '',
	helperText,
	InputProps,
	...rest
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
			// disabled
			readOnly
			helperText={helperText}
			variant='outlined'
			InputProps={InputProps}
			{...rest}
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
		<Card className={classes.card} raised={false} variant='outlined'>
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
	updateMultipleFields,
	validations,
	validateId,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const { address, decimals, symbol } = selectMainToken()
	const { minPerImpression, rulesInput = { inputs: {} } } = item
	const { autoSetMinCPM } = rulesInput.inputs
	const active = !!activeFields.minPerImpression
	const { minPerImpression: errMin } = validations
	const showError = !!errMin && errMin.dirty
	const minCPM =
		typeof minPerImpression === 'object'
			? formatTokenAmount(
					bigNumberify((item.minPerImpression || {})[address] || '0').mul(1000),
					decimals,
					true
			  )
			: minPerImpression

	return (
		<OutlinedPropView
			label={t('MIN_CPM_SLOT_LABEL', { args: [symbol] })}
			value={
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='outlined'
							type='text'
							required
							label={t('MIN_CPM_SLOT_LABEL_MANUAL')}
							name='minPerImpression'
							value={minCPM || ''}
							disabled={!!autoSetMinCPM || !active}
							onChange={ev => {
								const value = ev.target.value
								updateField('minPerImpression', value)
								execute(
									validateNumberString({
										validateId,
										prop: 'minPerImpression',
										value,
										dirty: true,
									})
								)
							}}
							error={showError}
							maxLength={120}
							helperText={
								showError ? errMin.errMsg : t('SLOT_MANUAL_CPM_MIN_HELPER')
							}
							InputProps={
								!autoSetMinCPM
									? {
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
									  }
									: {}
							}
						/>
					</Grid>

					<Grid item xs={12}>
						<OutlinedPropView
							label={t('SLOT_AUTO_MIN_CPM_LABEL')}
							value={
								<FormControl>
									<FormGroup row>
										<FormControlLabel
											control={
												<Checkbox
													checked={!!autoSetMinCPM}
													onChange={ev => {
														const checked = ev.target.checked
														updateField(
															'rulesInput',
															{
																...rulesInput,
																inputs: {
																	...rulesInput.inputs,
																	autoSetMinCPM: checked,
																},
															},
															{
																name: 'autoSetMinCPM',
																fields: ['rulesInput'],
															}
														)
													}}
													value='autoSetMinCPM'
												/>
											}
											label={t('SLOT_AUTO_MIN_CPM_INFO_LABEL')}
										/>
									</FormGroup>
								</FormControl>
							}
						/>
					</Grid>
				</Grid>
			}
		/>
	)
}
export const SlotAdultContent = ({
	item = {},
	// validations,
	updateField,
	// setActiveFields,
	// returnPropToInitialState,
	// activeFields = {},
}) => {
	const { rulesInput = { inputs: {} } } = item
	const { allowAdultContent } = rulesInput.inputs

	return (
		<OutlinedPropView
			label={t('SLOT_ALLOW_ADULT_CONTENT_LABEL')}
			value={
				<FormControl>
					<FormGroup row>
						<FormControlLabel
							control={
								<Checkbox
									checked={!!allowAdultContent}
									onChange={ev =>
										updateField(
											'rulesInput',
											{
												...rulesInput,
												inputs: {
													...rulesInput.inputs,
													allowAdultContent: ev.target.checked,
												},
											},
											{
												name: 'allowAdultContent',
												fields: ['rulesInput'],
											}
										)
									}
									value='allowAdultContent'
								/>
							}
							label={t('SLOT_ALLOW_ADULT_CONTENT_INFO_LABEL')}
						/>
					</FormGroup>
				</FormControl>
			}
		/>
	)
}

export const ItemWebsite = ({
	item = {},
	initialItemState = {},
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
				updateField('website', (ev.target.value || '').trim())
			}}
			disabled={!!initialItemState.website || !active}
			error={showError}
			helperText={
				showError ? (
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
				endAdornment: !initialItemState.website && (
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

export const ArchiveItemBtn = ({
	itemId,
	itemType = '',
	title,
	isIconBtn,
	onSuccess,
	goToTableOnSuccess,
	fullWidth,
}) => {
	const labelArgs = itemType.toUpperCase()

	const onClick = () => {
		execute(
			confirmAction(
				() =>
					execute(
						archiveItem({ itemId, itemType, onSuccess, goToTableOnSuccess })
					),
				null,
				{
					confirmLabel: t(`ARCHIVE_CONFIRM_LABEL`, {
						args: [labelArgs],
					}),
					cancelLabel: t('CANCEL'),
					title: t(`ARCHIVE_CONFIRM_TITLE`, {
						args: [labelArgs, title],
					}),
					text: t(`ARCHIVE_CONFIRM_INFO`, {
						args: [labelArgs, title],
					}),
				}
			)
		)
	}
	return (
		<Tooltip
			title={t('LABEL_ARCHIVE', { args: [labelArgs] })}
			aria-label='archive'
		>
			{isIconBtn ? (
				<IconButton onClick={onClick} aria-label={`archive-${itemId}`}>
					<ArchiveIcon color='action' />
				</IconButton>
			) : (
				<Button
					fullWidth={fullWidth}
					color='default'
					variant='contained'
					onClick={onClick}
					aria-label={`archive-${itemId}`}
				>
					{t('ARCHIVE')}
				</Button>
			)}
		</Tooltip>
	)
}
