import React from 'react'
import { Box, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const styles = theme => {
	return {
		labelImg: {
			height: theme.spacing(3),
			width: theme.spacing(3),
			marginRight: theme.spacing(2),
			backgroundColor: theme.palette.common.white,
		},
	}
}

const useStyles = makeStyles(styles)
export const DiversifyPreview = ({ tokensOutData, assetsData }) => {
	const classes = useStyles()
	return (
		<Box>
			{tokensOutData.map(({ address, amountOutMin, share }) => {
				const { logoSrc, name, symbol } = assetsData[address]
				return (
					<Box
						key={address}
						display='flex'
						flexDirection='row'
						alignItems='center'
						justifyContent='space-betweens'
					>
						<Box display='flex' flexDirection='row' alignItems='center'>
							<Avatar src={logoSrc} alt={name} className={classes.labelImg} />
							<Box>
								{name} ({symbol})
							</Box>
						</Box>
						<Box display='flex' flexDirection='row' alignItems='center'>
							<Box>{`${share}% - `} </Box>
							<Box>{amountOutMin}</Box>
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}
