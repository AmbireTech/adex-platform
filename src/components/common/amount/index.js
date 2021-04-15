import React, { Fragment } from 'react'
import { Box } from '@material-ui/core'
import { formatNumberWithCommas } from 'helpers/formatters'

const AmountUnit = ({ unit }) => (
	<Box component='div' display='inline'>
		{unit}
	</Box>
)

export function AmountWithCurrency({
	amount,
	toFixed = 2,
	unit,
	unitPlace = 'right',
	fontSize,
	multiline,
}) {
	const formattedAmount = formatNumberWithCommas(
		parseFloat(amount).toFixed(toFixed)
	)
	const decimalSeparatorSplit = formattedAmount.split('.')

	return (
		<Box
			component='div'
			display={multiline ? 'block' : 'inline'}
			width={multiline ? 1 : 'auto'}
			fontSize={fontSize}
		>
			{unit && unitPlace === 'left' && <AmountUnit unit={unit} />}{' '}
			<Box component='div' display='inline'>
				{decimalSeparatorSplit[0]}
				{'.'}
			</Box>
			<Box
				component='div'
				display='inline'
				style={{ opacity: '0.56' }}
				fontSize={fontSize * 0.8}
			>
				{decimalSeparatorSplit[1] || '00'}
			</Box>{' '}
			{unit && unitPlace === 'right' && <AmountUnit unit={unit} />}
		</Box>
	)
}

function AmountTextSingle({ text = '', fontSize, multiline }) {
	const decimalSeparatorSplit = text.split('.')

	if (decimalSeparatorSplit.length > 1) {
		const decimalsSplit = decimalSeparatorSplit[1].split(' ')
		const rest = decimalsSplit.slice(2)

		return (
			<Box
				component='div'
				display={multiline ? 'block' : 'inline'}
				width={multiline ? 1 : 'auto'}
				fontSize={fontSize}
			>
				<Box component='div' display='inline'>
					{decimalSeparatorSplit[0]}
					{'.'}
				</Box>
				<Box
					component='div'
					display='inline'
					style={{ opacity: '0.56' }}
					fontSize={fontSize * 0.8}
				>
					{decimalsSplit[0]}
				</Box>
				{decimalsSplit[1] && (
					<Box component='div' display='inline' fontSize={fontSize * 0.8}>
						{' '}
						{decimalsSplit[1]}
					</Box>
				)}
				{!!rest.length && (
					<Box component='div' display='inline'>
						{' '}
						{rest.join(' ')}
					</Box>
				)}
			</Box>
		)
	} else {
		return text
	}
}

export function AmountText({ text = '', fontSize, multiline, children }) {
	const transValue = children ? children.join(';') : ''

	const multipleAmountsSplit = (text || transValue)
		.split(';')
		.map(x => x.trim())
		.filter(x => !!x)

	return (
		<Fragment>
			{multipleAmountsSplit.length
				? multipleAmountsSplit
						.map((x, i) => (
							<AmountTextSingle
								key={i + x.toString()}
								text={x}
								fontSize={fontSize}
								multiline={multiline}
							/>
						))
						.reduce((prev, curr) => [prev, multiline ? null : '; ', curr])
				: text}
		</Fragment>
	)
}
