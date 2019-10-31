import React from 'react'
import PropTypes from 'prop-types'
import keycode from 'keycode'
import Downshift from 'downshift'
import Paper from '@material-ui/core/Paper'
import Chip from '@material-ui/core/Chip'
import { renderInput, getSuggestions, renderSuggestion } from './common'

class DownshiftMultiple extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			inputValue: '',
			selectedItem: props.value || [],
		}
	}

	handleKeyDown = event => {
		const { inputValue, selectedItem } = this.state
		if (
			selectedItem.length &&
			!inputValue.length &&
			keycode(event) === 'backspace'
		) {
			const newItemValue = selectedItem.slice(0, selectedItem.length - 1)
			this.setState({
				selectedItem: newItemValue,
			})

			this.props.onChange(newItemValue)
		}
	}

	handleInputChange = event => {
		const value = event.target.value.toLowerCase()
		this.setState({ inputValue: value })
	}

	handleChange = item => {
		let { selectedItem } = this.state

		if (selectedItem.indexOf(item.value) === -1) {
			selectedItem = [...selectedItem, item.value]
		}

		this.setState({
			inputValue: '',
			selectedItem,
		})

		this.props.onChange(selectedItem)
	}

	handleDelete = item => () => {
		const selectedItem = [...this.state.selectedItem]
		selectedItem.splice(selectedItem.indexOf(item), 1)

		this.setState({ selectedItem })
		this.props.onChange(selectedItem)
	}

	/**
	 * source {'propValue': 'propsLabel'} - skip one mapping to get the label for Chip
	 */
	render() {
		const {
			classes,
			source,
			label,
			id,
			placeholder,
			helperText,
			openOnClick,
			allowCreate,
			validateCreation,
		} = this.props
		const { inputValue, selectedItem } = this.state
		const allValues = Object.keys(source).map(key => {
			return { value: key, label: source[key] }
		})

		return (
			<Downshift
				inputValue={inputValue}
				onChange={this.handleChange}
				selectedItem={selectedItem}
				// defaultIsOpen={true}
				itemToString={item => item.label}
			>
				{({
					getInputProps,
					getItemProps,
					isOpen,
					inputValue: inputValue2,
					selectedItem: selectedItem2,
					highlightedIndex,
					toggleMenu,
				}) => (
					<div className={classes.container}>
						{renderInput({
							fullWidth: true,
							classes,
							helperText,
							label,
							InputProps: getInputProps({
								startAdornment: selectedItem.map(item => (
									<Chip
										key={item}
										tabIndex={-1}
										label={source[item]}
										className={classes.chip}
										onDelete={this.handleDelete(item)}
									/>
								)),
								onChange: this.handleInputChange,
								onKeyDown: this.handleKeyDown,
								placeholder,
								id,
								onClick: () => openOnClick && toggleMenu(),
							}),
						})}
						{isOpen ? (
							<Paper className={classes.paper} square>
								//TODO: use FixedSizeList!
								{getSuggestions(
									inputValue2,
									allValues,
									allowCreate,
									validateCreation
								).map((suggestion, index) =>
									renderSuggestion({
										suggestion,
										index,
										itemProps: getItemProps({ item: suggestion }),
										highlightedIndex,
										selectedItem: selectedItem2,
									})
								)}
							</Paper>
						) : null}
					</div>
				)}
			</Downshift>
		)
	}
}

DownshiftMultiple.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default DownshiftMultiple
