import React from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import Paper from '@material-ui/core/Paper'
import { renderInput, getSuggestions, renderSuggestion } from './common'
import FormHelperText from '@material-ui/core/FormHelperText'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
class DownshiftSingle extends React.Component {
	constructor(props) {
		super(props)
		this.props.onInit()
		this.state = {
			inputValue: '',
		}
	}

	handleChange = item => {
		const selectedItem = item ? item.value || item.label : item
		console.log('SELECTED', item)
		this.props.onChange(selectedItem)
	}

	handleInputChange = inputValue => {
		if (this.state.inputValue !== inputValue) this.setState({ inputValue })
	}

	render() {
		const {
			classes,
			source,
			error,
			label,
			id,
			placeholder,
			helperText,
			errorText,
			showSelected,
			value,
			openOnClick,
			allowCreate,
			validateCreation,
			variant,
		} = this.props
		const allValues = source //Object.keys(source).map(key => { return { value: key, label: source[key] } })
		const suggestions = getSuggestions(
			this.state.inputValue,
			allValues,
			allowCreate,
			validateCreation
		).map(option => {
			const firstLetter = option.label[0].toUpperCase()
			return {
				firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
				...option,
			}
		})

		return (
			<Autocomplete
				id='grouped-demo'
				options={suggestions.sort(
					(a, b) => -b.firstLetter.localeCompare(a.firstLetter)
				)}
				// groupBy={option => option.firstLetter}
				getOptionLabel={option => option.label}
				onChange={(event, newValue) => this.handleChange(newValue)}
				selectedItem={value}
				style={{ width: 300 }}
				renderInput={params => {
					this.handleInputChange(params.inputProps.value)
					return (
						<TextField
							{...params}
							label='With categories'
							variant='outlined'
							fullWidth
						/>
					)
				}}
			/>
			// <Downshift
			// 	onChange={this.handleChange}
			// 	itemToString={item => (item || {}).label || item || ''}
			// 	selectedItem={value}
			// >
			// 	{({
			// 		getInputProps,
			// 		getItemProps,
			// 		isOpen,
			// 		inputValue,
			// 		selectedItem,
			// 		highlightedIndex,
			// 		clearSelection,
			// 		toggleMenu,
			// 	}) => {
			// 		this.handleInputChange(inputValue)
			// 		return (
			// 			<div className={classes.container}>
			// 				{renderInput({
			// 					label,
			// 					value: inputValue,
			// 					fullWidth: true,
			// 					classes,
			// 					helperText,
			// 					variant,
			// 					InputProps: getInputProps({
			// 						id,
			// 						onClick: () => {
			// 							if (openOnClick) {
			// 								clearSelection()
			// 								toggleMenu()
			// 							}
			// 						},
			// 						error,
			// 						placeholder,
			// 					}),
			// 				})}
			// 				{isOpen && suggestions.length > 0 ? (
			// 					<Paper className={classes.paper} square>
			// 						<AutoSizer>
			// 							{({ height, width }) => (
			// 								<FixedSizeList
			// 									className={classes.paper}
			// 									height={height}
			// 									width={width}
			// 									itemSize={46}
			// 									itemCount={suggestions.length}
			// 								>
			// 									{({ index, style }) =>
			// 										renderSuggestion({
			// 											suggestion: suggestions[index],
			// 											index,
			// 											style,
			// 											itemProps: getItemProps({
			// 												item: suggestions[index],
			// 											}),
			// 											highlightedIndex,
			// 											selectedItem,
			// 											showSelected,
			// 										})
			// 									}
			// 								</FixedSizeList>
			// 							)}
			// 						</AutoSizer>
			// 					</Paper>
			// 				) : null}
			// 				{error && (
			// 					<FormHelperText error id='component-error-text'>
			// 						{errorText}
			// 					</FormHelperText>
			// 				)}
			// 			</div>
			// 		)
			// 	}}
			// </Downshift>
		)
	}
}

DownshiftSingle.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default DownshiftSingle
