import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import { translate } from '../../../services/translations/translations'

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

// const newSuggestion = (inputValue) => {
//     return {
//         label: `${translate('CREATE_TAG_LABEL')} "${inputValue.toLowerCase().trim()}"`,
//         value: inputValue.toLowerCase().trim()
//     }
// }

renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.number,
    index: PropTypes.number,
    itemProps: PropTypes.object,
    selectedItem: PropTypes.string,
    suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired,
}

export const getSuggestions = (inputValue, source, allowCreate) => {
    if (!inputValue) {
        return source
    } else {
        source = source.filter(suggestion => {
            return (!inputValue || suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
        })

        // Making sure that an option to create a new item will exist when needed
        // const values = source.map((item) => {
        //     return item.value
        // })
        // if (!values.includes(inputValue) && allowCreate) {
        //     source.push(newSuggestion(inputValue))
        // }
        
        return source
    }
}