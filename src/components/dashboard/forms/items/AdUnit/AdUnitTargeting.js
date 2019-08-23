import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import Autocomplete from 'components/common/autocomplete'
import Typography from '@material-ui/core/Typography'
import Dropdown from 'components/common/dropdown'
import { constants } from 'adex-models'
import { translate } from 'services/translations/translations'
import { withStyles } from '@material-ui/core/styles'

const autocompleteLocationsSingleSelect = () => {
	return constants.AllCountries.map(country => {
		return {
			label: country.name,
			value: country.value,
		}
	})
}

const autocompleteGendersSingleSelect = () => {
	return constants.Genders.map(gender => {
		return {
			label: translate(gender.split('_')[1]),
			value: gender,
		}
	})
}

const autocompleteTagsSingleSelect = () => {
	return constants.PredefinedTags.map(tag => {
		return {
			label: tag._id,
			value: tag._id,
		}
	})
}

const AcLocations = autocompleteLocationsSingleSelect()
const AcGenders = autocompleteGendersSingleSelect()
const AcTags = autocompleteTagsSingleSelect()

const SOURCES = {
	locations: { src: AcLocations, collection: 'targeting' },
	genders: { src: AcGenders, collection: 'targeting' },
	tags: { src: AcTags, collection: 'targeting' },
	custom: { src: [], collection: 'targeting' },
}

const styles = {
	slider: {
		padding: '22px 0px',
	},
}

const SourcesSelect = Object.keys(SOURCES).map(key => {
	return {
		value: {
			key: key, // FOR DROPDOWN
			source: key,
			collection: SOURCES[key].collection,
			target: { tag: '', score: 1 },
			label: translate(`TARGET_LABEL_${key.toUpperCase()}`),
			placeholder: translate(`TARGET_LABEL_${key.toUpperCase()}`),
		},
		label: translate(`ADD_NEW_${key.toUpperCase()}_TARGET`),
	}
})

class AdUnitTargeting extends Component {
	constructor(props) {
		super(props)

		const { targets } = props.newItem.temp || {}
		this.state = {
			targets: targets || [],
		}
	}

	updateNewItemCollections(targets) {
		const collections = [...targets].reduce((all, tg) => {
			const newCollection = all[tg.collection] || []
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

	newTarget = target => {
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
		classes,
	}) => {
		return (
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Autocomplete
						id={'target-' + index}
						direction='auto'
						openOnClick
						onChange={newValue =>
							this.handleTargetChange(index, 'tag', newValue, collection)
						}
						label={label}
						placeholder={placeholder}
						source={source}
						value={target.tag}
						suggestionMatch='anywhere'
						showSuggestionsWhenValueIsSet={true}
						allowCreate={!source.length}
					/>
				</Grid>
				<Grid item xs={12} md={6}>
					<div>
						<Typography id={`target-score-${index}`}>
							{/*TODO: Translate target name*/}
							{t('TARGET_SCORE_LABEL', {
								args: [target.score],
							})}
						</Typography>
						<Slider
							// classes={{ container: classes.slider }}
							aria-labelledby={`target-score-${index}`}
							min={1}
							max={100}
							step={1}
							valueLabelDisplay='auto'
							disabled={!target.tag}
							value={target.score}
							onChange={(ev, newValue) =>
								this.handleTargetChange(index, 'score', newValue, collection)
							}
						/>
					</div>
				</Grid>
			</Grid>
		)
	}

	render() {
		const {
			t,
			// newItem,
			classes,
		} = this.props
		// const { targeting, tags } = newItem

		const { targets } = this.state

		return (
			<div>
				<Grid container spacing={1}>
					<Grid item sm={12}>
						{[...targets].map(
							(
								{ source, collection, label, placeholder, target = {} } = {},
								index
							) => (
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
							)
						)}
					</Grid>
					<Grid item sm={12}>
						<Dropdown
							variant='filled'
							fullWidth
							onChange={target => {
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
			</div>
		)
	}
}

AdUnitTargeting.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

const NewAdUnitTargeting = NewAdUnitHoc(withStyles(styles)(AdUnitTargeting))

export default Translate(NewAdUnitTargeting)
