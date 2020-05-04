import React from 'react'
import { useSelector } from 'react-redux'
import Img from 'components/common/img/Img'
import TargetsList from 'components/dashboard/containers/TargetsList'
import {
	PropRow,
	ContentBox,
	ContentBody,
} from 'components/common/dialog/content'
import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { execute, getCategorySuggestions } from 'actions'
import { styles } from '../styles'
import {
	t,
	selectNewAdUnit,
	selectAccountIdentityAddr,
	selectSpinnerById,
} from 'selectors'
import { GV_TARGETING_SUGGESTIONS } from 'constants/spinners'

const useStyles = makeStyles(styles)

function AdUnitPreview(props) {
	const classes = useStyles()
	const { type, title, description, temp, targeting, targetUrl } = useSelector(
		selectNewAdUnit
	)
	const autoTargetingSpinner = useSelector(state =>
		selectSpinnerById(state, GV_TARGETING_SUGGESTIONS)
	)
	const autoTargets = (temp.targets || [])
		.filter(i => i.auto)
		.reduce((aggr, curr) => {
			aggr.push(curr.target)
			return aggr
		}, [])

	const manualTargets = (temp.targets || [])
		.filter(i => !i.auto)
		.reduce((aggr, curr) => {
			aggr.push(curr.target)
			return aggr
		}, [])

	React.useEffect(() => {
		execute(
			getCategorySuggestions({
				itemType: 'AdUnit',
				collection: 'targeting',
				validateId: props.validateId,
			})
		)
	}, [props.validateId])

	const identityAddr = useSelector(selectAccountIdentityAddr)
	return (
		<ContentBox>
			<ContentBody>
				<Grid container>
					<Grid item xs={12} md={6}>
						<PropRow left={t('title', { isProp: true })} right={title} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('owner', { isProp: true })} right={identityAddr} />
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('targetUrl', { isProp: true })}
							right={targetUrl}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow left={t('type', { isProp: true })} right={type} />
					</Grid>

					<Grid item xs={12}>
						<PropRow
							left={t('description', { isProp: true })}
							right={description}
						/>
					</Grid>

					<Grid item xs={12} md={6}>
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
					</Grid>

					<Grid item xs={12} md={6}>
						<PropRow
							left={t('targeting', { isProp: true })}
							right={
								<TargetsList
									targets={manualTargets}
									// subHeader={'TARGETING'}
								/>
							}
						/>
						<PropRow
							left={t('AUTO_TARGETING')}
							right={
								autoTargetingSpinner ? (
									t(`ANALYZING_AUTO_TARGETING`)
								) : (
									<TargetsList
										targets={autoTargets}
										// subHeader={'TARGETING'}
									/>
								)
							}
						/>
					</Grid>
				</Grid>
			</ContentBody>
		</ContentBox>
	)
}

export default AdUnitPreview
