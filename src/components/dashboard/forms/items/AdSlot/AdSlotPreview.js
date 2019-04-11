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

class AdSlotPreview extends Component {
	constructor(props) {
		super(props)
		this.save = props.save
	}

	SlotFallback = ({ item, t, classes }) => {
		return (
			<div>
				<PropRow
					left={t('SLOT_FALLBACK_IMG_LABEL')}
					right={
						<Img
							allowFullscreen={true}
							className={classes.imgPreview}
							src={item.fallbackAdImg.tempUrl || ''}
							alt={item.fallbackAdUrl}
						/>
					}
				/>
				<PropRow
					left={t('fallbackAdUrl', { isProp: true })}
					right={<Anchor href={item.fallbackAdUrl} target='_blank'>{item.fallbackAdUrl}</Anchor>}
				/>
			</div>
		)
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
					<PropRow
						left={t('MEDIA')}
						right={
							<Img
								allowFullscreen={true}
								className={classes.imgPreview}
								src={temp.tempUrl || ''}
								alt={title}
							/>
						}
					/>
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
