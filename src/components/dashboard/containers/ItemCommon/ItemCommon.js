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
				{rest.activeFields.fallbackAdUrl ?
					<TextField
						// required
						autoFocus
						type='text'
						label={t('fallbackAdUrl', { isProp: true })}
						value={item.fallbackAdUrl || ''}
						onChange={(ev) => rest.handleChange('fallbackAdUrl', ev.target.value)}
						// maxLength={1024}
						onBlur={() => { rest.setActiveFields('fallbackAdUrl', false); rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: true }); }}
						onFocus={() => rest.validate('fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
						error={errFallbackAdUrl && !!errFallbackAdUrl.dirty ? <span> {errFallbackAdUrl.errMsg} </span> : null}
						helperText={!errFallbackAdUrl || !errFallbackAdUrl.dirty ?
							<div>
								{t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}
							</div> : null}
					/>
					:
					<div >
						<div>
							{item.fallbackAdUrl ?
								<Anchor href={item.fallbackAdUrl} target='_blank'>
									{item.fallbackAdUrl}
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
									onClick={() => rest.setActiveFields('fallbackAdUrl', true)}
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

const basicProps = ({ item, t, rightComponent, url, classes, canEditImg, itemType, ...rest }) => {
	const mediaUrl = item.mediaUrl || item.fallbackMediaUrl

	return (
		<div >
			<Grid container spacing={16}>
				<Grid item xs={12} sm={12} md={12} lg={7}>
					<div >
						<div
							className={classes.basicInfo}
						>
							{
								itemType === 'AdSlot'
									? <ValidatedFallbackAdData validateId={item._id} item={item} t={t} url={url} classes={classes} canEditImg={canEditImg} {...rest} />
									:
									<Card
										className={classes.card}
										raised={false}
									>
										<CardMedia
											classes={{ root: classes.mediaRoot }}
										>
											<Img
												allowFullscreen={true}
												src={mediaUrl}
												alt={item.title}
												className={classes.img}
											/>
										</CardMedia>
										{canEditImg &&
											<Button
												variant='fab'
												mini
												color='secondary'
												onClick={rest.toggleImgEdit}
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
							}
							<div>
								<div>
									<TextField
										// type='text'
										value={item.type}
										label={t('type', { isProp: true })}
										disabled
										margin='dense'
									/>
								</div>
								{Array.isArray(item.tags) &&
									<div>
										<TextField
											value={item.tags.map(tag=> `"${tag.tag}(${tag.score})"` ).join(',\n')}
											label={t('tags', { isProp: true }) + ` (${item.tags.length})`}
											disabled
											margin='dense'
											multiline
											rows={7}
										/>
									</div>
								}
							</div>
						</div>

					</div>
					<br />
				</Grid>
				<Grid item xs={12} sm={12} md={12} lg={5}>
					{rightComponent}
				</Grid>
			</Grid>
		</div >
	)
}

export const BasicProps = withStyles(styles)(basicProps)