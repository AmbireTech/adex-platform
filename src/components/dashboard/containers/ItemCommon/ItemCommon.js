import React from 'react'
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
import Fab from '@material-ui/core/Fab'
import EditIcon from '@material-ui/icons/Edit'
import Img from 'components/common/img/Img'
import { validUrl } from 'helpers/validators'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
// import { utils } from 'ethers'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { contracts } from 'services/smart-contracts/contractsCfg'
import { validations } from 'adex-models'
import { utils } from 'ethers'

const { DAI } = contracts

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
	const minCPM = formatTokenAmount(
		bigNumberify((item.minPerImpression || {})[DAI.address] || '0').mul(1000),
		18,
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
			<InputLabel>{t('MIN_CPM_SLOT_LABEL', { args: ['SAI'] })}</InputLabel>
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
							<ValidatedFallbackAdData
								validateId={item._id}
								item={item}
								t={t}
								url={url}
								classes={classes}
								canEditImg={canEditImg}
								activeFields={activeFields}
								{...rest}
							/>
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
										validateId={item._id}
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
							{Array.isArray(item.tags) && (
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
	// console.log('item', item)
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
											</Grid>
										</Grid>
										<Grid item xs={12} sm={12} md={6}>
											<Grid container spacing={1}>
												<Grid item xs={12}>
													<TextField
														// type='text'
														value={status.name}
														label={t('status', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
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
															formatTokenAmount(item.depositAmount, 18) + ' SAI'
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
																18,
																true
															) + ' SAI'
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
