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
				border: '0 !important',
			},
			'&:before': {
				border: '0 !important',
			},
		},
		dayWrapper: {
			position: 'relative',
		},
		day: {
			width: 36,
			height: 36,
			fontSize: theme.typography.caption.fontSize,
			margin: '0 2px',
			color: 'inherit',
		},
		customDayHighlight: {
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: '2px',
			right: '2px',
			border: `1px solid ${theme.palette.secondary.main}`,
			borderRadius: '50%',
		},
		nonCurrentMonthDay: {
			color: theme.palette.text.disabled,
		},
		highlightNonCurrentMonthDay: {
			color: '#676767',
		},
		highlight: {
			background: theme.palette.primary.main,
			color: theme.palette.common.white,
		},
		firstHighlight: {
			extend: 'highlight',
			borderTopLeftRadius: '50%',
			borderBottomLeftRadius: '50%',
		},
		endHighlight: {
			extend: 'highlight',
			borderTopRightRadius: '50%',
			borderBottomRightRadius: '50%',
		},
		dayDisabled: {
			color: 'rgba(0, 0, 0, 0.38)',
			pointerEvents: 'none',
		},
	}
}
