import React from 'react'
import PropTypes from 'prop-types'
import keycode from 'keycode'
import Downshift from 'downshift'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import MenuItem from '@material-ui/core/MenuItem'
import Chip from '@material-ui/core/Chip'
import { styles } from './styles'

function renderInput(inputProps) {
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

function renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
    const isHighlighted = highlightedIndex === index
    const isSelected = (selectedItem || '').indexOf(suggestion.value) > -1

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

function getSuggestions(inputValue, source) {
    let count = 0

    return source.filter(suggestion => {
        const keep =
            (!inputValue || suggestion.label.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) &&
            count < 55

        if (keep) {
            count += 1
        }

        return keep
    }) || source
}

class DownshiftMultiple extends React.Component {
    state = {
        inputValue: '',
        selectedItem: [],
    }

    handleKeyDown = event => {
        const { inputValue, selectedItem } = this.state
        if (selectedItem.length && !inputValue.length && keycode(event) === 'backspace') {
            this.setState({
                selectedItem: selectedItem.slice(0, selectedItem.length - 1),
            })
        }
    }

    handleInputChange = event => {
        this.setState({ inputValue: event.target.value })
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
        selectedItem.splice(selectedItem.indexOf(item.value), 1)

        this.setState({ selectedItem })
        this.props.onChange(selectedItem)
    }

    render() {
        const { classes, source, label, id } = this.props
        const { inputValue, selectedItem } = this.state
        const allValues = Object.keys(source).map(key => { return { value: key, label: source[key] } })

        return (
            <Downshift
                inputValue={inputValue}
                onChange={this.handleChange}
                selectedItem={selectedItem}
                // defaultIsOpen={true}
                itemToString={(item) => item.label}
            >
                {({
                    getInputProps,
                    getItemProps,
                    isOpen,
                    inputValue: inputValue2,
                    selectedItem: selectedItem2,
                    highlightedIndex,
                }) => (
                        <div className={classes.container}>
                            {renderInput({
                                fullWidth: true,
                                classes,
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
                                    placeholder: label,
                                    id: id,
                                }),
                            })}
                            {isOpen ? (
                                <Paper className={classes.paper} square>
                                    {getSuggestions(inputValue2, allValues).map((suggestion, index) =>
                                        renderSuggestion({
                                            suggestion,
                                            index,
                                            itemProps: getItemProps({ item: suggestion }),
                                            highlightedIndex,
                                            selectedItem: selectedItem2,
                                        }),
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

function Autocomplete(props) {
    const { classes, source, multiple, ...rest } = props

    return (
        <div >
            {multiple ?
                <DownshiftMultiple classes={classes} source={source} {...rest} />
                :
                <Downshift
                    itemToString={(item) => item.label}
                >
                    {({ getInputProps, getItemProps, isOpen, inputValue, selectedItem, highlightedIndex }) => (
                        <div className={classes.container}>
                            {renderInput({
                                fullWidth: true,
                                classes,
                                InputProps: getInputProps({
                                    placeholder: props.label,
                                    id: props.id,
                                }),
                            })}
                            {isOpen ? (
                                <Paper className={classes.paper} square>
                                    {getSuggestions(inputValue, source).map((suggestion, index) =>
                                        renderSuggestion({
                                            suggestion,
                                            index,
                                            itemProps: getItemProps({ item: suggestion.label }),
                                            highlightedIndex,
                                            selectedItem,
                                        }),
                                    )}
                                </Paper>
                            ) : null}
                        </div>
                    )}
                </Downshift>
            }
        </div>
    )
}

Autocomplete.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Autocomplete)