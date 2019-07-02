import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import Anchor from 'components/common/anchor/anchor'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import { withStyles } from '@material-ui/core/styles'
import { styles } from '../styles'

const SlotFallback = ({ img, targetUrl, t, classes }) => {
	return (
		<div>
			<PropRow
				left={t('SLOT_FALLBACK_IMG_LABEL')}
				right={
					<Img
						allowFullscreen={true}
						classes={{ img: classes.imgPreview, wrapper: classes.imgPreviewWrapper }}
						src={img.tempUrl || ''}
						alt={targetUrl}
						mediaMime={img.mime}
						allowVideo
					/>
				}
			/>
			<PropRow
				left={t('fallbackAdUrl', { isProp: true })}
				right={<Anchor href={targetUrl} target='_blank'>{targetUrl}</Anchor>}
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
		const { classes, account, ...rest } = this.props
		const { newItem, t } = rest
		const {
			type,
			title,
			description,
			temp,
			targeting,
			targetUrl,
			tags
		} = newItem

		return (
			<ContentBox>
				<ContentBody>
					<PropRow
						left={t('owner', { isProp: true })}
						right={account.wallet.address}
					/>
					<PropRow
						left={t('type', { isProp: true })}
						right={type}
					/>
					<PropRow
						left={t('title', { isProp: true })}
						right={title}
					/>
					<PropRow
						left={t('description', { isProp: true })}
						right={description}
					/>
					{temp.useFallback &&
						<SlotFallback img={temp} targetUrl={targetUrl} t={t} classes={classes} />}
					{tags && <PropRow
						left={t('tags', { isProp: true })}
						right={
							<UnitTargets
								{...rest}
								targets={tags}
								t={t}
							// subHeader={'TAGS'}
							/>
						}
					/>}
					{/* </Grid> */}
					<br />
				</ContentBody>
			</ContentBox>
		)
	}
}

AdSlotPreview.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string
}

function mapStateToProps(state) {
	const { persist } = state
	return {
		account: persist.account
	}
}

const NewAdSlotPreview = NewAdSlotHoc(withStyles(styles)(AdSlotPreview))
export default connect(
	mapStateToProps
)(Translate(NewAdSlotPreview))
