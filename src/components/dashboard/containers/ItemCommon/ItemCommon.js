import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import Img from 'components/common/img/Img'
import { validUrl } from 'helpers/validators'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { utils } from 'ethers'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'


const FallbackAdData = ({ item, t, rightComponent, url, classes, canEditImg, isDemo, ...rest }) => {
	const errFallbackAdUrl = rest.invalidFields['fallbackAdUrl']

	return (
		<Card
			className={classes.card}
			raised={false}
		>
			<CardMedia
				classes={{ root: classes.mediaRoot }}
				src=''
			>
				<Img
					allowFullscreen={true}
					className={classes.img}
					src={item.fallbackMediaUrl}
					alt={item.fallbackTargetUrl}
					style={{ cursor: 'pointer' }}
				/>
			</CardMedia>
			<Button
				variant='fab'
				mini
				color='secondary'
				onClick={rest.toggleFallbackImgEdit}
				className={classes.editIcon}
				disabled={isDemo}
			>
				<EditIcon />
			</Button>
			<CardContent>
				{rest.activeFields.fallbackTargetUrl ?
					<TextField
						// required
						autoFocus
						type='text'
						label={t('fallbackTargetUrl', { isProp: true })}
						value={item.fallbackTargetUrl || ''}
						onChange={(ev) => rest.handleChange('fallbackTargetUrl', ev.target.value)}
						// maxLength={1024}
						onBlur={() => { rest.setActiveFields('fallbackTargetUrl', false); rest.validate('fallbackTargetUrl', { isValid: !item.fallbackTargetUrl || validUrl(item.fallbackTargetUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: true }); }}
						onFocus={() => rest.validate('fallbackTargetUrl', { isValid: !item.fallbackTargetUrl || validUrl(item.fallbackTargetUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
						error={errFallbackAdUrl && !!errFallbackAdUrl.dirty ? <span> {errFallbackAdUrl.errMsg} </span> : null}
						helperText={!errFallbackAdUrl || !errFallbackAdUrl.dirty ?
							<div>
								{t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}
							</div> : null}
					/>
					:
					<div >
						<div>
							{item.fallbackTargetUrl ?
								<Anchor href={item.fallbackTargetUrl} target='_blank'>
									{item.fallbackTargetUrl}
								</Anchor>
								:
								<span style={{ opacity: 0.3 }}> {t('NO_FALLBACK_URL_YET')}</span>
							}
							<span>
								<IconButton
									disabled={!canEditImg}
									size='small'
									className={classes.buttonRight}
									color='secondary'
									onClick={() => rest.setActiveFields('fallbackTargetUrl', true)}
								>
									<EditIcon />
								</IconButton>
							</span>
						</div>
						{errFallbackAdUrl && !!errFallbackAdUrl.dirty ?
							<div>
								<span className={classes.error}> {errFallbackAdUrl.errMsg} </span>
							</div> : null}
					</div>
				}
			</CardContent>
		</Card>
	)
}

const ValidatedFallbackAdData = ValidItemHoc(FallbackAdData)

const MediaCard = ({ classes, mediaUrl, title, canEditImg, toggleImgEdit, url }) => <Card
	className={classes.card}
	raised={false}
>
	<CardMedia
		classes={{ root: classes.mediaRoot }}
	>
		<Img
			allowFullscreen={true}
			src={mediaUrl}
			alt={title}
			className={classes.img}
		/>
	</CardMedia>
	{canEditImg &&
		<Button
			variant='fab'
			mini
			color='secondary'
			onClick={toggleImgEdit}
			className={classes.editIcon}
		>
			<EditIcon />
		</Button>
	}

	{url &&
		<CardContent>
			<Anchor href={url} target='_blank'>
				{url}
			</Anchor>
		</CardContent>
	}
</Card>

const basicProps = ({ item, t, rightComponent, url, classes, canEditImg, itemType, ...rest }) => {
	const mediaUrl = item.mediaUrl || item.fallbackMediaUrl

	return (
		<Grid container spacing={16}>
			<Grid item xs={12} sm={12} md={12} lg={7}>
				<Grid container spacing={16}>
					<Grid item xs={12} sm={5} md={5} lg={5} >
						{
							itemType === 'AdSlot'
								? <ValidatedFallbackAdData validateId={item._id} item={item} t={t} url={url} classes={classes} canEditImg={canEditImg} {...rest} />
								:
								<MediaCard
									classes={classes}
									mediaUrl={mediaUrl}
									title={item.title}
									canEditImg={canEditImg}
									toggleImgEdit={rest.toggleImgEdit}
									url={url}
								/>
						}
					</Grid>
					<Grid item xs={12} sm={7} md={7} lg={7} >
						<Grid container spacing={8}>
							<Grid item xs={12} >

								<TextField
									// type='text'
									value={item.type}
									label={t('type', { isProp: true })}
									disabled
									margin='dense'
									fullWidth
								/>
							</Grid>
							{Array.isArray(item.tags) &&
								<Grid item xs={12} >
									<TextField
										value={item.tags.map(tag => `"${tag.tag}(${tag.score})"`).join(',\n')}
										label={t('tags', { isProp: true }) + ` (${item.tags.length})`}
										disabled
										margin='dense'
										multiline
										fullWidth
										rows={7}
									/>
								</Grid>
							}
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

const campaignProps = ({ item, t, rightComponent, url, classes, canEditImg, itemType, ...rest }) => {
	const mediaUrl = item.mediaUrl || item.fallbackMediaUrl
	console.log('item', item)
	return (
		<div >
			<Grid container spacing={16}>
				<Grid item xs={12} sm={12} md={12} lg={8}>
					<div >
						<div
							className={classes.basicInfo}
						>
							<Grid container spacing={16}>
								<Grid item xs={12} sm={5} md={5} lg={5} >
									<MediaCard
										classes={classes}
										mediaUrl={mediaUrl}
										title={item.title}
										canEditImg={canEditImg}
										toggleImgEdit={rest.toggleImgEdit}
										url={url}
									/>
								</Grid>
								<Grid item xs={12} sm={7} md={7} lg={7} >
									<Grid container spacing={8}>
										<Grid item xs={12} sm={12} md={6} >
											<Grid container spacing={8}>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={item.id}
														label={t('id', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={formatDateTime(item.created)}
														label={t('created', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={formatDateTime(item.activeFrom)
														}
														label={t('activeFrom', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} >
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
										<Grid item xs={12} sm={12} md={6} >
											<Grid container spacing={8}>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={item.creator}
														label={t('creator', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={utils.formatUnits(item.depositAmount, 18) + ' DAI'}
														label={t('depositAmount', { isProp: true })}
														disabled
														margin='dense'
														fullWidth
													/>
												</Grid>
												<Grid item xs={12} >
													<TextField
														// type='text'
														value={formatTokenAmount(
															bigNumberify(item.minPerImpression).mul(1000),
															18, true) + ' DAI'}
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
		</div >
	)
}

export const CampaignProps = withStyles(styles)(campaignProps)