import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/lab/Slider'
import Autocomplete from 'components/common/autocomplete'
import Typography from '@material-ui/core/Typography'
import Dropdown from 'components/common/dropdown'
import { constants } from 'adex-models'
import { translate } from 'services/translations/translations'
import { withStyles } from '@material-ui/core/styles'

const autocompleteTagsSingleSelect = () => {
	return constants.PredefinedTags.map(tag => {
		return {
			label: tag._id,
			value: tag._id
		}
	})
}

const AcTags = autocompleteTagsSingleSelect()

const SOURCES = {
	tags: { src: AcTags, collection: 'tags' }
}

const styles = {
	slider: {
		padding: '22px 0px',
	}
}

const SourcesSelect = Object.keys(SOURCES)
	.map(key => {
		return {
			value: {
				key: key, // FOR DROPDOWN
				source: key,
				collection: SOURCES[key].collection,
				target: { tag: '', score: 0 },
				label: `TAG_LABEL_${key.toUpperCase()}`,
				placeholder: `TAG_LABEL_${key.toUpperCase()}`
			},
			label: `ADD_NEW_${key.toUpperCase()}_TARGET`
		}
	})

class AdSlotTargeting extends Component {
	constructor(props) {
		super(props)

		const { targets } = props.newItem.temp || {}
		this.state = {
			targets: targets || []
		}
	}

	updateNewItemCollections(targets) {
		const collections = [...targets]
			.reduce((all, tg) => {
				const newCollection = ((all[tg.collection] || []))
				// NOTE: just skip empty tags
				if (!!tg.target.tag) {
					newCollection.push(tg.target)
				}
				all[tg.collection] = newCollection
				return all
			}, {})

		const { temp } = this.props.newItem
		const newTemp = { ...temp }

		// Need this to keep the state if user get back
		newTemp.targets = [...targets]
		collections.temp = newTemp

		this.props.handleChange(null, null, collections)
	}

	handleTargetChange = (index, prop, newValue) => {
		const newTargets = [...this.state.targets]
		const target = newTargets[index]
		const newTarget = { ...target }
		newTarget.target[prop] = newValue
		newTargets[index] = { ...target }

		this.updateNewItemCollections(newTargets)
		this.setState({ targets: newTargets })
	}

	newTarget = (target) => {
		const newTargets = [...this.state.targets]
		const newTarget = { ...target }
		newTarget.key = newTargets.length
		newTarget.target = { ...target.target }
		newTargets.push(newTarget)
		this.setState({ targets: newTargets })
	}

	targetTag = ({
		source,
		collection,
		placeholder,
		label,
		index,
		target,
		t,
		classes
	}) => {
		return (
			<Grid
				container
				spacing={16}
			>
				<Grid item xs={12} md={6} >
					<Autocomplete
						id={'target-' + index}
						direction="auto"
						openOnClick
						onChange={(newValue) =>
							this.handleTargetChange(
								index,
								'tag',
								newValue,
								collection
							)
						}
						label={label}
						placeholder={placeholder}
						source={source}
						value={target.tag}
						suggestionMatch='anywhere'
						showSuggestionsWhenValueIsSet={true}
						allowCreate={false}
					/>
				</Grid>
				<Grid item xs={12} md={6} >
					<div>
						<Typography
							id={`target-score-${index}`}
						>
							{/*TODO: Translate target name*/}
							{t('TARGET_SCORE_LABEL',
								{
									args: [target.score]
								})}
						</Typography>
						<Slider
							classes={{ container: classes.slider }}
							aria-labelledby={`target-score-${index}`}
							min={0} max={100}
							step={1}
							disabled={!target.tag}
							value={target.score}
							onChange={(ev, newValue) =>
								this.handleTargetChange(
									index,
									'score',
									newValue,
									collection
								)
							}
						/>
					</div>
				</Grid>

			</Grid >
		)
	}

	render() {
		const {
			t,
			newItem,
			classes
		} = this.props
		// const { targeting, tags } = newItem

		const { targets } = this.state

		return (
			<div>
				<Grid
					container
					spacing={24}
				>
					<Grid item sm={12}>
						{[...targets].map(({
							source,
							collection,
							label,
							placeholder,
							target = {}
						} = {}, index) =>
							<this.targetTag
								key={index} // TODO
								label={t(label)}
								placeholder={t(placeholder)}
								index={index}
								source={SOURCES[source].src}
								collection={collection}
								target={target}
								t={t}
								classes={classes}
							/>
						)}
					</Grid>
					<Grid item sm={12}>
						<Dropdown
							variant='filled'
							fullWidth
							onChange={(target) => {
								this.newTarget({ ...target })
							}}
							source={[...SourcesSelect]}
							value={''}
							label={t('NEW_TARGET')}
							htmlId='ad-type-dd'
							name='adType'
						/>
					</Grid>
				</Grid>
			</div >
		)
	}
}

AdSlotTargeting.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

const NewAdSlotTargeting = NewAdSlotHoc(withStyles(styles)(AdSlotTargeting))

export default Translate(NewAdSlotTargeting)
