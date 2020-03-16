import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Typography } from '@material-ui/core'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import Anchor from 'components/common/anchor/anchor'
import {
	PropRow,
	ContentBox,
	ContentBody,
} from 'components/common/dialog/content'
import { withStyles } from '@material-ui/core/styles'
import { styles } from '../styles'
import { selectMainToken } from 'selectors'

const SlotFallback = ({ img, targetUrl, t, classes }) => {
	return (
		<div>
			<PropRow
				left={t('SLOT_FALLBACK_IMG_LABEL')}
				right={
					<Img
						allowFullscreen={true}
						classes={{
							img: classes.imgPreview,
							wrapper: classes.imgPreviewWrapper,
						}}
						src={img.tempUrl || ''}
						alt={targetUrl}
						mediaMime={img.mime}
						allowVideo
					/>
				}
			/>
			<PropRow
				left={t('fallbackAdUrl', { isProp: true })}
				right={
					<Anchor href={targetUrl} target='_blank'>
						{targetUrl}
					</Anchor>
				}
			/>
		</div>
	)
}

class AdSlotPreview extends Component {
	constructor(props) {
		super(props)
		this.save = props.save
	}

	render() {
		const { classes, account, mainTokenSymbol, ...rest } = this.props
		const { newItem, t } = rest
		const {
			type,
			title,
			description,
			website,
			temp,
			tags,
			targetUrl,
			minPerImpression,
		} = newItem

		return (
			<ContentBox>
				<ContentBody>
					<PropRow
						left={t('owner', { isProp: true })}
						right={account.wallet.address}
					/>
					<PropRow left={t('type', { isProp: true })} right={type} />
					<PropRow left={t('title', { isProp: true })} right={title} />
					<PropRow
						left={t('description', { isProp: true })}
						right={description}
					/>
					<PropRow left={t('website', { isProp: true })} right={website} />
					<PropRow
						right={
							<Fragment>
								<Typography component='div'>
									<div
										dangerouslySetInnerHTML={{
											__html: t('SLOT_WEBSITE_WARNING'),
										}}
									/>
								</Typography>
								<Typography component='div'>
									<div
										dangerouslySetInnerHTML={{
											__html: t('SLOT_WEBSITE_CODE_WARNING'),
										}}
									/>
								</Typography>
							</Fragment>
						}
					/>
					{temp.hostname && temp.issues && temp.issues.length && (
						<PropRow
							right={
								<Fragment>
									{temp.issues.map(x => (
										<Typography key={x} component='div'>
											{t(x)}
										</Typography>
									))}
								</Fragment>
							}
						/>
					)}

					<PropRow
						left={t('MIN_CPM_SLOT_LABEL')}
						right={`${minPerImpression} ${mainTokenSymbol}`}
					/>
					{temp.useFallback && (
						<SlotFallback
							img={temp}
							targetUrl={targetUrl}
							t={t}
							classes={classes}
						/>
					)}
					{/* </Grid> */}
					<br />
					{tags && (
						<PropRow
							left={t('tags', { isProp: true })}
							right={
								<UnitTargets
									{...rest}
									targets={tags}
									t={t}
									// subHeader={'TARGETING'}
								/>
							}
						/>
					)}
				</ContentBody>
			</ContentBox>
		)
	}
}

AdSlotPreview.propTypes = {
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
}

function mapStateToProps(state) {
	const { persist } = state
	return {
		account: persist.account,
		mainTokenSymbol: selectMainToken(state).symbol,
	}
}

const NewAdSlotPreview = NewAdSlotHoc(withStyles(styles)(AdSlotPreview))
export default connect(mapStateToProps)(Translate(NewAdSlotPreview))
