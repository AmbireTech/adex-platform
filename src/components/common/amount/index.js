import React from 'react'
import { Box } from '@material-ui/core'
import { formatFloatNumberWithCommas } from 'helpers/formatters'
import { validations } from 'adex-models'
const { isNumberString } = validations

const AmountUnit = ({ unit }) => (
	<Box
		component='span'
		display='inline'
		color='secondary.main'
		whiteSpace='break-spaces'
		// wordBreak='break-word'
	>
		{unit}
	</Box>
)

export function AmountWithCurrency({
	amount,
	toFixed = 4,
	unit,
	unitPlace = 'right',
	// Typography variants to take the advantage of the responsive text size
	mainFontVariant = 'h5',
	decimalsFontVariant = 'h6',
	multiline,
}) {
	if (!isNumberString(amount)) {
		return 'N/A'
	}

	const formattedAmount = formatFloatNumberWithCommas(
		parseFloat(amount).toFixed(toFixed)
	)
	const decimalSeparatorSplit = formattedAmount.split('.')

	return (
		<Box
			component={multiline ? 'div' : 'span'}
			display={multiline ? 'block' : 'inline'}
			width={multiline ? 1 : 'auto'}
		>
			<Box
				component='span'
				display='inline'
				fontSize={`${mainFontVariant}.fontSize`}
			>
				{unit && unitPlace === 'left' && <AmountUnit unit={unit} />}{' '}
				{decimalSeparatorSplit[0]}
				{'.'}
				<Box
					component='span'
					display='inline'
					fontSize={`${decimalsFontVariant}.fontSize`}
					color='secondary.dark'
				>
					{decimalSeparatorSplit[1] || '00'}
				</Box>{' '}
				{unit && unitPlace === 'right' && <AmountUnit unit={unit} />}
			</Box>
		</Box>
	)
}
