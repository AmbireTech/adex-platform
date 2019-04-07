import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/lab/Slider'
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
			value: country.value
		}
	})
}

const autocompleteGendersSingleSelect = () => {
	return constants.Genders.map(gender => {
		return {
			label: translate(gender.split('_')[1]),
			value: gender
		}
	})
}

const AcLocations = autocompleteLocationsSingleSelect()
const AcGenders = autocompleteGendersSingleSelect()

const SOURCES = {
	locations: AcLocations,
	genders: AcGenders
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
				target: { tag: '', score: 0 },
				label: `TARGET_LABEL_${key.toUpperCase()}`,
				placeholder: `TARGET_LABEL_${key.toUpperCase()}`
			},
			label: `ADD_NEW_${key.toUpperCase()}_TARGET`
		}
	})

class AdUnitTargeting extends Component {
	constructor(props) {
		super(props)

		this.state = {
			targets: []
		}
	}

	componentDidMount() {

	}

	handleTargetChange = (index, prop, newValue) => {
		const newTargets = [...this.state.targets]
		const target = newTargets[index]
		const newTarget = { ...target }
		newTarget.target[prop] = newValue
		newTargets[index] = {...target}
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
		placeholder,
		label,
		value,
		id,
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
								newValue
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
							value={target.score}
							onChange={(ev, newValue) =>
								this.handleTargetChange(
									index,
									'score',
									newValue
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
		const { targeting } = newItem

		const { targets } = this.state

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						{[...targets].map(({ source, label, placeholder, target = {} } = {}, index) =>
							<this.targetTag
								key={index} // TODO
								label={t(label)}
								placeholder={t(placeholder)}
								index={index}
								source={SOURCES[source]}
								target={target}
								t={t}
								classes={classes}
							/>
						)}
					</Grid>
					<Grid item sm={12}>
						<Dropdown
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
