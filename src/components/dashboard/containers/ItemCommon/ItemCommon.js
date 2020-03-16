import React, { Fragment } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import Img from 'components/common/img/Img'
import { validUrl } from 'helpers/validators'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { validations, schemas, Joi } from 'adex-models'
import { utils } from 'ethers'
import { mapStatusIcons } from 'components/dashboard/containers/Tables/tableHelpers'
import { selectMainToken } from 'selectors'
import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'

const FallbackAdData = ({
	item,
	t,
	rightComponent,
	url,
	classes,
	canEditImg,
	isDemo,
	activeFields,
	setActiveFields,
	validate,
	invalidFields,
	toggleFallbackImgEdit,
	handleChange,
	...rest
}) => {
	const errFallbackAdUrl = invalidFields['fallbackAdUrl']

	return (
		<Card className={classes.card} raised={false}>
			<CardMedia classes={{ root: classes.mediaRoot }} src=''>
				<Img
					allowFullscreen={true}
					className={classes.img}
					src={item.fallbackMediaUrl}
					alt={item.fallbackTargetUrl}
					style={{ cursor: 'pointer' }}
				/>
			</CardMedia>
			{/* <Fab
				mini
				color='secondary'
				onClick={toggleFallbackImgEdit}
				className={classes.editIcon}
				disabled={isDemo}
			>
				<EditIcon />
			</Fab> */}
			<CardContent>
				{activeFields.fallbackTargetUrl ? (
					<TextField
						// required
						autoFocus
						type='text'
						label={t('fallbackTargetUrl', { isProp: true })}
						value={item.fallbackTargetUrl || ''}
						onChange={ev => handleChange('fallbackTargetUrl', ev.target.value)}
						// maxLength={1024}
						onBlur={() => {
							setActiveFields('fallbackTargetUrl', false)
							validate('fallbackTargetUrl', {
								isValid:
									!item.fallbackTargetUrl || validUrl(item.fallbackTargetUrl),
								err: { msg: 'ERR_INVALID_URL' },
								dirty: true,
							})
						}}
						onFocus={() =>
							rest.validate('fallbackTargetUrl', {
								isValid:
									!item.fallbackTargetUrl || validUrl(item.fallbackTargetUrl),
								err: { msg: 'ERR_INVALID_URL' },
								dirty: false,
							})
						}
						error={
							errFallbackAdUrl && !!errFallbackAdUrl.dirty ? (
								<span> {errFallbackAdUrl.errMsg} </span>
							) : null
						}
						helperText={
							!errFallbackAdUrl || !errFallbackAdUrl.dirty ? (
								<div>{t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}</div>
							) : null
						}
					/>
				) : (
					<div>
						<div>
							{item.fallbackTargetUrl ? (
								<Anchor href={item.fallbackTargetUrl} target='_blank'>
									{item.fallbackTargetUrl}
								</Anchor>
							) : (
								<span style={{ opacity: 0.3 }}>
									{' '}
									{t('NO_FALLBACK_URL_YET')}
								</span>
							)}
							{/* <span>
								<IconButton
									// disabled={!canEditImg}
									size='small'
									className={classes.buttonRight}
									color='secondary'
									onClick={() =>
										rest.setActiveFields('fallbackTargetUrl', true)
									}
								>
									<EditIcon />
								</IconButton>
							</span> */}
						</div>
						{errFallbackAdUrl && !!errFallbackAdUrl.dirty ? (
							<div>
								<span className={classes.error}>
									{' '}
									{errFallbackAdUrl.errMsg}{' '}
								</span>
							</div>
						) : null}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

const ValidatedFallbackAdData = ValidItemHoc(FallbackAdData)

const updateItemTemp = ({ prop = '', value = '', item = {} } = {}) => {
	const { temp } = item
	const newTemp = { ...temp }
	newTemp[prop] = value

	return newTemp
}

const validateAmount = (value = '', prop, dirty, errMsg, validate) => {
	const isValidNumber = validations.isNumberString(value)
	const isValid = isValidNumber && utils.parseUnits(value, 18)

	validate(prop, {
		isValid: isValid,
		err: { msg: errMsg || 'ERR_INVALID_AMOUNT' },
		dirty: dirty,
	})
}

const validateWebsite = (value = '', prop, dirty, errMsg, validate) => {
	const result = Joi.validate(value, schemas.adSlotPut.website)

	const isValid = !result.error

	validate(prop, {
		isValid: isValid,
		err: { msg: errMsg || 'SLOT_WEBSITE_ERR' },
		dirty: dirty,
	})
}

const SlotMinCPM = ({
	item,
	t,
	rightComponent,
	url,
	classes,
	canEditImg,
	isDemo,
	activeFields,
	setActiveFields,
	validate,
	invalidFields,
	toggleFallbackImgEdit,
	handleChange,
	...rest
}) => {
	const errMin = invalidFields['minPerImpression']
	const { address, decimals, symbol } = selectMainToken()
	const minCPM = formatTokenAmount(
		bigNumberify((item.minPerImpression || {})[address] || '0').mul(1000),
		decimals,
		true
	)

	const minPerImpression =
		item.temp.minPerImpression !== undefined
			? item.temp.minPerImpression
			: minCPM

	return (
		<FormControl
			fullWidth
			className={classes.textField}
			margin='dense'
			error={!!errMin}
		>
			<InputLabel>{t('MIN_CPM_SLOT_LABEL', { args: [symbol] })}</InputLabel>
			<Input
				fullWidth
				autoFocus
				type='text'
				name={'minPerImpression'}
				value={minPerImpression || ''}
				onChange={ev => {
					validateAmount(
						ev.target.value,
						'minPerImpression',
						true,
						'',
						validate
					)
					handleChange(
						'temp',
						updateItemTemp({
							prop: 'minPerImpression',
							value: ev.target.value,
							item,
						})
					)
				}}
				maxLength={1024}
				onBlur={ev => {
					setActiveFields('minPerImpression', false)
				}}
				disabled={!activeFields.minPerImpression}
				endAdornment={
					<InputAdornment position='end'>
						<IconButton
							// disabled
							// size='small'
							disabled={activeFields['minPerImpression'] || isDemo}
							color='secondary'
							className={classes.buttonRight}
							onClick={ev => setActiveFields('minPerImpression', true)}
						>
							<EditIcon />
						</IconButton>
					</InputAdornment>
				}
			/>

			<FormHelperText>
				{errMin && !!errMin.errMsg
					? t(errMin.errMsg, { args: errMin.errMsgArgs })
					: t('SLOT_MIN_CPM_HELPER')}
			</FormHelperText>
		</FormControl>
	)
}

const ValidatedSlotMinCPM = ValidItemHoc(SlotMinCPM)

const SlotWebsite = ({
	item,
	t,
	rightComponent,
	url,
	classes,
	canEditImg,
	isDemo,
	activeFields,
	setActiveFields,
	validate,
	invalidFields,
	handleChange,
	...rest
}) => {
	const errWebsite = invalidFields['website']

	const website = item.temp.website

	return (
		<FormControl
			fullWidth
			className={classes.textField}
			margin='dense'
			error={!!errWebsite && activeFields.website}
		>
			<InputLabel>{t('SLOT_WEBSITE')}</InputLabel>
			<Input
				fullWidth
				autoFocus
				type='text'
				name={'website'}
				value={website || item.website || ''}
				onChange={ev => {
					validateWebsite(ev.target.value, 'website', true, '', validate)
					handleChange(
						'temp',
						updateItemTemp({
							prop: 'website',
							value: ev.target.value,
							item,
						})
					)
				}}
				maxLength={1024}
				onBlur={ev => {
					setActiveFields('website', false)
				}}
				disabled={!!item.website || !activeFields.website}
				endAdornment={
					!item.website && (
						<InputAdornment position='end'>
							<IconButton
								disabled={activeFields.website || isDemo}
								color='secondary'
								className={classes.buttonRight}
								onClick={ev => setActiveFields('website', true)}
							>
								<EditIcon />
							</IconButton>
						</InputAdornment>
					)
				}
			/>

			<FormHelperText component='div'>
				{errWebsite && !!errWebsite.errMsg && activeFields.website ? (
					t(errWebsite.errMsg, { args: errWebsite.errMsgArgs })
				) : (
					<Fragment>
						{activeFields.website && (
							<div
								dangerouslySetInnerHTML={{
									__html: t('SLOT_MIN_CPM_HELPER'),
								}}
							/>
						)}
						<div
							dangerouslySetInnerHTML={{
								__html: t('SLOT_WEBSITE_CODE_WARNING'),
							}}
						/>
					</Fragment>
				)}
			</FormHelperText>
		</FormControl>
	)
}

const ValidatedSlotWebsite = ValidItemHoc(SlotWebsite)

const MediaCard = ({
	classes,
	mediaUrl,
	mediaMime,
	title,
	canEditImg,
	toggleImgEdit,
	url,
}) => (
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
				<EditIcon />
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

const basicProps = ({
	item,
	t,
	rightComponent,
	url,
	classes,
	canEditImg,
	itemType,
	activeFields,
	validateId,
	...rest
}) => {
	const mediaUrl = item.mediaUrl
	const mediaMime = item.mediaMime

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} sm={12} md={12} lg={7}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={5} md={5} lg={5}>
						{itemType === 'AdSlot' ? (
							<Fragment>
								<ValidatedFallbackAdData
									validateId={validateId}
									item={item}
									t={t}
									url={url}
									classes={classes}
									canEditImg={canEditImg}
									activeFields={activeFields}
									{...rest}
								/>
								<WebsiteIssues website={item.website} />
							</Fragment>
						) : (
							<MediaCard
								classes={classes}
								mediaUrl={mediaUrl}
								mediaMime={mediaMime}
								title={item.title}
								canEditImg={canEditImg}
								toggleImgEdit={rest.toggleImgEdit}
								url={url}
							/>
						)}
					</Grid>
					<Grid item xs={12} sm={7} md={7} lg={7}>
						<Grid container spacing={1}>
							{itemType === 'AdSlot' && (
								<Grid item xs={12}>
									<ValidatedSlotMinCPM
										validateId={validateId}
										item={item}
										t={t}
										url={url}
										classes={classes}
										canEditImg={canEditImg}
										activeFields={activeFields}
										{...rest}
									/>
								</Grid>
							)}
							{itemType === 'AdSlot' && (
								<Grid item xs={12}>
									<ValidatedSlotWebsite
										validateId={validateId}
										item={item}
										t={t}
										url={url}
										classes={classes}
										canEditImg={canEditImg}
										activeFields={activeFields}
										{...rest}
										margin='dense'
										fullWidth
									/>
								</Grid>
							)}
							<Grid item xs={12}>
								<TextField
									// type='text'
									value={item.type}
									label={t('type', { isProp: true })}
									disabled
									margin='dense'
									fullWidth
								/>
							</Grid>
							{Array.isArray(item.tags) && itemType === 'AdSlot' && (
								<Grid item xs={12}>
									<TextField
										value={item.tags
											.map(tag => `"${tag.tag}(${tag.score})"`)
											.join(',\n')}
										label={
											t('tags', { isProp: true }) + ` (${item.tags.length})`
										}
										disabled
										margin='dense'
										multiline
										fullWidth
										rows={7}
									/>
								</Grid>
							)}
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12} sm={12} md={12} lg={5}>
				{rightComponent}
			</Grid>
		</Grid>
	)
}

export const BasicProps = withStyles(styles)(basicProps)

const campaignProps = ({
	item,
	t,
	rightComponent,
	url,
	classes,
	canEditImg,
	itemType,
	...rest
}) => {
	const mediaUrl = item.mediaUrl
	const status = item.status || {}
	const { decimals, symbol } = selectMainToken()
	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={12} md={12} lg={8}>
					<div>
						<div className={classes.basicInfo}>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={5} md={5} lg={5}>
									<MediaCard
										classes={classes}
										mediaUrl={mediaUrl}
										title={item.title}
										canEditImg={canEditImg}
										toggleImgEdit={rest.toggleImgEdit}
										url={url}
									/>
								</Grid>
								<Grid item xs={12} sm={7} md={7} lg={7}>
									<Grid container spacing={1}>
										<Grid item xs={12} sm={12} md={6}>
											<Grid container spacing={1}>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={item.id}
														label={t('id', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={formatDateTime(item.created)}
														label={t('created', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={formatDateTime(item.activeFrom)}
														label={t('activeFrom', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={formatDateTime(item.withdrawPeriodStart)}
														label={t('withdrawPeriodStart', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={item.minTargetingScore > 0}
														label={t('CAMPAIGN_MIN_TARGETING')}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
											</Grid>
										</Grid>
										<Grid item xs={12} sm={12} md={6}>
											<Grid container spacing={1}>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={status.humanFriendlyName}
														label={t('status', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
														InputProps={{
															endAdornment: (
																<InputAdornment position='end'>
																	{mapStatusIcons(
																		status.humanFriendlyName,
																		status.name,
																		'md'
																	)}
																</InputAdornment>
															),
														}}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={(
															(status.fundsDistributedRatio || 0) / 10
														).toFixed(2)}
														label={t('PROP_DISTRIBUTED', { args: ['%'] })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={
															formatTokenAmount(item.depositAmount, decimals) +
															' ' +
															symbol
														}
														label={t('depositAmount', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={
															formatTokenAmount(
																bigNumberify(item.minPerImpression).mul(1000),
																decimals,
																true
															) +
															' ' +
															symbol
														}
														label={t('CPM', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</div>
					<br />
				</Grid>
				<Grid item xs={12} sm={12} md={12} lg={4}>
					{rightComponent}
				</Grid>
			</Grid>
		</div>
	)
}

// ((status.fundsDistributedRatio || 0) / 10).toFixed(2)
export const CampaignProps = withStyles(styles)(campaignProps)
