import React from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import Paper from '@material-ui/core/Paper'
import { renderInput, getSuggestions, renderSuggestion } from './common'
import FormHelperText from '@material-ui/core/FormHelperText'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
class DownshiftSingle extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			inputValue: '',
		}
	}

	handleChange = item => {
		const selectedItem = item ? item.value || item.label : item
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
		} = this.props
		const allValues = source //Object.keys(source).map(key => { return { value: key, label: source[key] } })
		const suggestions = getSuggestions(
			this.state.inputValue,
			allValues,
			allowCreate,
			validateCreation
		)
		return (
			<Downshift
				onChange={this.handleChange}
				itemToString={item => (item || {}).label || item || ''}
				selectedItem={value}
			>
				{({
					getInputProps,
					getItemProps,
					isOpen,
					inputValue,
					selectedItem,
					highlightedIndex,
					clearSelection,
					toggleMenu,
				}) => {
					this.handleInputChange(inputValue)
					return (
						<div className={classes.container}>
							{renderInput({
								label,
								value: inputValue,
								fullWidth: true,
								classes,
								helperText,
								InputProps: getInputProps({
									id,
									onClick: () => {
										if (openOnClick) {
											clearSelection()
											toggleMenu()
										}
									},
									error,
									placeholder,
								}),
							})}
							{isOpen && suggestions.length > 0 ? (
								<Paper className={classes.paper} square>
									<AutoSizer>
										{({ height, width }) => (
											<FixedSizeList
												className={classes.paper}
												height={height}
												width={width}
												itemSize={46}
												itemCount={suggestions.length}
											>
												{({ index, style }) =>
													renderSuggestion({
														suggestion: suggestions[index],
														index,
														style,
														itemProps: getItemProps({
															item: suggestions[index],
														}),
														highlightedIndex,
														selectedItem,
														showSelected,
													})
												}
											</FixedSizeList>
										)}
									</AutoSizer>
								</Paper>
							) : null}
							{error && (
								<FormHelperText error id='component-error-text'>
									{errorText}
								</FormHelperText>
							)}
						</div>
					)
				}}
			</Downshift>
		)
	}
}

DownshiftSingle.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default DownshiftSingle
