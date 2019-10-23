import React from 'react'
import PropTypes from 'prop-types'
import Downshift from 'downshift'
import Paper from '@material-ui/core/Paper'
import { renderInput, getSuggestions, renderSuggestion } from './common'
import FormHelperText from '@material-ui/core/FormHelperText'
import { FixedSizeList } from 'react-window'

class DownshiftSingle extends React.Component {
	constructor(props) {
		super(props)
		this.props.onInit()
	}

	handleChange = item => {
		const selectedItem = item ? item.value || item.label : item
		this.props.onChange(selectedItem)
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
		const suggestions = (inputValue = '') =>
			getSuggestions(inputValue, allValues, allowCreate, validateCreation)
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
				}) => (
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
						{isOpen ? (
							<Paper className={classes.paper} square>
								{/* <AutoSizer>
									{({ height, width }) => (
										<List
											className='List'
											height={height}
											itemCount={1000}
											itemSize={35}
											width={width}
										></List>
									)}
								</AutoSizer> */}
								<FixedSizeList
									height={400}
									width={360}
									itemSize={46}
									itemCount={suggestions.length}
								>
									{({ index }) =>
										renderSuggestion({
											suggestion: suggestions[index],
											index,
											itemProps: getItemProps({ item: suggestions[index] }),
											highlightedIndex,
											selectedItem,
											showSelected,
										})
									}
								</FixedSizeList>
								{/* {getSuggestions(
									inputValue,
									allValues,
									allowCreate,
									validateCreation
								).map((suggestion, index) =>
									renderSuggestion({
										suggestion,
										index,
										itemProps: getItemProps({ item: suggestion }),
										highlightedIndex,
										selectedItem,
										showSelected,
									})
								)} */}
							</Paper>
						) : null}
						{error && (
							<FormHelperText error id='component-error-text'>
								{errorText}
							</FormHelperText>
						)}
					</div>
				)}
			</Downshift>
		)
	}
}

DownshiftSingle.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default DownshiftSingle
