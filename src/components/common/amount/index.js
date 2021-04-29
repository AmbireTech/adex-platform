import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { formatNumberWithCommas } from 'helpers/formatters'
import { validations } from 'adex-models'
const { isNumberString } = validations

const AmountUnit = ({ unit }) => (
	<Box component='div' display='inline' color='secondary.light'>
		{unit}
	</Box>
)

export function AmountWithCurrency({
	amount,
	toFixed = 2,
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

	const formattedAmount = formatNumberWithCommas(
		parseFloat(amount).toFixed(toFixed)
	)
	const decimalSeparatorSplit = formattedAmount.split('.')

	return (
		<Box
			component='div'
			display={multiline ? 'block' : 'inline'}
			width={multiline ? 1 : 'auto'}
		>
			<Typography component='div' display='inline' variant={mainFontVariant}>
				{unit && unitPlace === 'left' && <AmountUnit unit={unit} />}{' '}
				{decimalSeparatorSplit[0]}
				{'.'}
				<Typography
					component='div'
					display='inline'
					variant={decimalsFontVariant}
					color='secondary'
				>
					{decimalSeparatorSplit[1] || '00'}
				</Typography>{' '}
				{unit && unitPlace === 'right' && <AmountUnit unit={unit} />}
			</Typography>
		</Box>
	)
}
