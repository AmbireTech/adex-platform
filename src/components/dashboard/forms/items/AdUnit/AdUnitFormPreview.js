import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import { withStyles } from '@material-ui/core/styles'
import { styles } from '../styles'

class AdUnitFormPreview extends Component {
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
					{targeting && <PropRow
						left={t('targeting', { isProp: true })}
						right={
							<UnitTargets
								{...rest}
								targets={targeting}
								t={t}
							// subHeader={'TARGETING'}
							/>
						}
					/>}
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

AdUnitFormPreview.propTypes = {
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

const NewAdUnitFormPreview = NewAdUnitHoc(withStyles(styles)(AdUnitFormPreview))
export default connect(
	mapStateToProps
)(Translate(NewAdUnitFormPreview))
