import React from 'react'
import { useSelector } from 'react-redux'
import Img from 'components/common/img/Img'
import TargetsList from 'components/dashboard/containers/TargetsList'
import {
	PropRow,
	ContentBox,
	ContentBody,
} from 'components/common/dialog/content'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from '../styles'
import { t, selectNewAdUnit, selectAccountIdentityAddr } from 'selectors'

const useStyles = makeStyles(styles)

function AdUnitPreview() {
	const classes = useStyles()
	const { type, title, description, temp, targeting, targetUrl } = useSelector(
		selectNewAdUnit
	)
	const identityAddr = useSelector(selectAccountIdentityAddr)

	return (
		<ContentBox>
			<ContentBody>
				<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
				<PropRow left={t('type', { isProp: true })} right={type} />
				<PropRow left={t('title', { isProp: true })} right={title} />
				<PropRow
					left={t('description', { isProp: true })}
					right={description}
				/>
				<PropRow left={t('targetUrl', { isProp: true })} right={targetUrl} />

				<PropRow
					left={t('MEDIA')}
					right={
						<Img
							allowFullscreen={true}
							className={classes.imgPreview}
							src={temp.tempUrl || ''}
							alt={title}
							mediaMime={temp.mime}
							allowVideo
						/>
					}
				/>
				{targeting && (
					<PropRow
						left={t('targeting', { isProp: true })}
						right={
							<TargetsList
								targets={targeting}
								// subHeader={'TARGETING'}
							/>
						}
					/>
				)}
				{/* </Grid> */}
				<br />
			</ContentBody>
		</ContentBox>
	)
}

export default AdUnitPreview
