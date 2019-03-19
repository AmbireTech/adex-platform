export const styles = theme => {
	return {
		datepickerContrastInput: {
			color: theme.palette.common.white,
		},
		datepickerContrastLabel: {
			color: theme.palette.common.white,
			'&$datepickerContrastLabelFocused': {
				color: theme.palette.common.white,
			},
		},
		datepickerContrastLabelFocused: {},
		datepickerContrastUnderline: {
			'&:after': {
				// borderBottomColor: theme.palette.common.white,
				border: '0 !important'
			},
			'&:before': {
				border: '0 !important'
			}
		},
	}
}
