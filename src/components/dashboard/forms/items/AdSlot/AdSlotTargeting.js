import React from 'react'
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import IconButton from '@material-ui/core/IconButton'
import CancelIcon from '@material-ui/icons/Cancel'
import Autocomplete from 'components/common/autocomplete'
import Typography from '@material-ui/core/Typography'
import Dropdown from 'components/common/dropdown'
import { translate } from 'services/translations/translations'
import { withStyles } from '@material-ui/core/styles'
import { SOURCES } from 'constants/targeting'
import classnames from 'classnames'
import Img from 'components/common/img/Img'
import EddieThinking from 'resources/eddie/eddie-13.png'
import ButtonLoading from 'components/common/spinners/ButtonLoading'
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects'

const styles = {
	slider: {
		padding: '22px 0px',
	},
	markLabel: {
		top: '30px',
	},
	loadingImg: {
		width: 'auto',
		height: 'auto',
		maxHeight: 150,
		maxWidth: 150,
		cursor: 'pointer',
	},
}
const marks = [
	{
		value: 5,
		label: 'Low',
	},
	{
		value: 50,
		label: 'Medium',
	},
	{
		value: 95,
		label: 'High',
	},
]

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

function AdSlotTargeting(props) {
	const {
		t,
		newItem,
		actions,
		classes,
		account,
		itemType,
		loadingTargetingSuggestions,
		...rest
	} = props
	const { targets } = newItem.temp || {}

	const TargetingTag = ({
		source,
		collection,
		placeholder,
		label,
		index,
		target,
		t,
		classes,
		invalidFields,
	}) => {
		const id = `target-${index}`
		return (
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Autocomplete
						id={id}
						direction='auto'
						openOnClick
						required={true}
						error={invalidFields[id] && invalidFields[id].dirty}
						errorText={
							invalidFields[id] && !!invalidFields[id].dirty
								? invalidFields[id].errMsg
								: null
						}
						onChange={newValue => {
							if (newValue) {
								handleTargetChange(index, 'tag', newValue, collection)
								validateAutocomplete({
									id,
									isValid: newValue,
									dirty: true,
								})
							}
						}}
						label={label}
						placeholder={placeholder}
						source={source}
						value={target.tag}
						suggestionMatch='anywhere'
						showSuggestionsWhenValueIsSet={true}
						allowCreate={!source.length}
						showSelected
					/>
				</Grid>
				<Grid item xs={11} md={5}>
					<div>
						<Typography id={`tbaget-score-${index}`}>
							{/*TODO: Translate target name*/}
							{t('TARGET_SCORE_LABEL', {
								args: [target.score],
							})}
						</Typography>
						<Slider
							classes={{ root: classes.slider, markLabel: classes.markLabel }}
							aria-labelledby={`target-score-${index}`}
							min={1}
							max={100}
							step={1}
							valueLabelDisplay='auto'
							disabled={!target.tag}
							value={target.score}
							marks={marks}
							onChange={(ev, newValue) =>
								handleTargetChange(index, 'score', newValue, collection)
							}
						/>
					</div>
				</Grid>
				<Grid item container xs={1} md={1} alignItems='center'>
					<IconButton onClick={() => removeTarget(index)}>
						<CancelIcon />
					</IconButton>
				</Grid>
			</Grid>
		)
	}
	const updateNewItemCollections = targets => {
		const { newItem, handleChange } = props
		const collections = [...(targets || [])].reduce(
			(all, tg) => {
				const newCollection = all[tg.collection] || []

				// NOTE: just skip empty tags
				if (!!tg.target.tag) {
					newCollection.push(tg.target)
				}
				all[tg.collection] = newCollection
				return all
			},
			{ targeting: [], tags: [] }
		)

		const { temp } = newItem
		const newTemp = { ...temp }

		// Need this to keep the state if user get back
		newTemp.targets = [...(targets || [])]
		collections.temp = newTemp

		handleChange(null, null, collections)
	}

	const handleTargetChange = (index, prop, newValue) => {
		const newTargets = [...targets]
		const newTarget = { ...newTargets[index].target }
		newTarget[prop] = newValue
		newTargets[index] = { ...newTargets[index], target: newTarget }
		updateNewItemCollections(newTargets)
	}

	const newTarget = target => {
		const newTargets = [...(targets || [])]
		const newTarget = { ...target }
		newTarget.target = { ...target.target }
		newTargets.push(newTarget)
		updateNewItemCollections(newTargets)
		validateAutocomplete({
			id: `target-${newTargets.length - 1}`,
			isValid: !!target.tag,
			dirty: true,
		})
	}

	const removeTarget = index => {
		const newTargets = [...targets]
		newTargets.splice(index, 1)
		validateAutocomplete({ isValid: true, removeAll: true })
		updateNewItemCollections(newTargets)
		newTargets.forEach((element, index) => {
			validateAutocomplete({
				id: `target-${index}`,
				isValid: !!element.target.tag,
				dirty: true,
			})
		})
	}

	const addCategorySuggestions = async ({ newItem, itemType }) => {
		props.validate('wait', { isValid: false })
		const { getCategorySuggestions } = props.actions
		const uniqueTargets = await getCategorySuggestions({ newItem, itemType })
		updateNewItemCollections(uniqueTargets)
		props.validate('wait', { isValid: true })
	}

	const validateAutocomplete = ({ id = '', isValid, dirty }) => {
		// take from actions
		props.validate(id, {
			isValid,
			err: { msg: 'TARGETING_REQUIRED' },
			dirty,
		})
	}

	return (
		<div>
			<Grid container spacing={1}>
				<Grid item sm={12}>
					{targets &&
						[...targets].map(
							(
								{ source, collection, label, placeholder, target = {} } = {},
								index
							) => (
								<TargetingTag
									key={index}
									label={t(label)}
									placeholder={t(placeholder)}
									index={index}
									source={SOURCES[source].src}
									collection={collection}
									target={target}
									t={t}
									classes={classes}
									{...rest}
								/>
							)
						)}
				</Grid>
				<Grid item sm={12}>
					<Dropdown
						variant='filled'
						fullWidth
						onChange={target => {
							newTarget({ ...target })
						}}
						source={[...SourcesSelect]}
						value={''}
						label={t('NEW_TARGET')}
						htmlId='ad-type-dd'
						name='adType'
					/>
				</Grid>
				<Grid item container justify='center'>
					<ButtonLoading
						loading={loadingTargetingSuggestions}
						onClick={() => addCategorySuggestions({ newItem, itemType })}
					>
						<EmojiObjectsIcon />
						{loadingTargetingSuggestions
							? t('WAITING_CATEGORY_SUGGESTIONS')
							: t('GET_CATEGORY_SUGGESTIONS')}
					</ButtonLoading>
				</Grid>
				{loadingTargetingSuggestions && (
					<Grid item container justify='center' className='pulse'>
						<Img
							className={classnames(classes.loadingImg)}
							src={EddieThinking}
						></Img>
					</Grid>
				)}
			</Grid>
		</div>
	)
}

AdSlotTargeting.propTypes = {
	actions: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
}

const NewAdSlotTargeting = NewAdSlotHoc(withStyles(styles)(AdSlotTargeting))

export default Translate(NewAdSlotTargeting)
