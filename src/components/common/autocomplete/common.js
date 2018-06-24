import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

export const renderInput = (inputProps) => {
    const { InputProps, classes, ref, ...other } = inputProps

    return (
        <TextField
            InputProps={{
                inputRef: ref,
                classes: {
                    root: classes.inputRoot,
                },
                ...InputProps,
            }}
            {...other}
        />
    )
}

export const renderSuggestion = ({ suggestion, index, itemProps, highlightedIndex, selectedItem, showSelected }) => {
    const isHighlighted = highlightedIndex === index
    // TODO: make it better
    // Note wo work with obj and array
    const isSelected = ((selectedItem || {}).value || selectedItem || '').indexOf(suggestion.value) > -1

    if (!showSelected && isSelected) {
        return null
    }

    return (
        <MenuItem
            {...itemProps}
            key={suggestion.value || suggestion.label}
            selected={isHighlighted}
            component="div"
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
        >
            {suggestion.label}
        </MenuItem>
    )
}
renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.number,
    index: PropTypes.number,
    itemProps: PropTypes.object,
    selectedItem: PropTypes.string,
    suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired,
}

export const getSuggestions = (inputValue, source) => {
    console.log('filter', inputValue)
    return source.filter(suggestion => {
        return (!inputValue || suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)

    }) || source // Return all on click
}