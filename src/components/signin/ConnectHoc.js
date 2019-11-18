import React from 'react'
import Logo from 'components/common/icons/AdexIconTxt'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Anchor from 'components/common/anchor/anchor'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import AuthSelect from 'components/signin/auth-select/AuthSelect'
import { t } from 'selectors'

export default function ConnectHoc(Decorated) {
	function Connect({ classes, noBackground, rest }) {
		return (
			<div className={classes.root}>
				<Grid
					className={classes.container}
					container
					alignItems='stretch'
					// spacing={2}
				>
					<Grid className={classes.actions} item xs={12} md={7} lg={8} xl={9}>
						<Box width={1} height={1} p={4}>
							<Box width={1} height={1} position='relative'>
								<Decorated t={t} {...rest} />
							</Box>
						</Box>
					</Grid>
					<Grid
						item
						container
						xs={12}
						md={5}
						lg={4}
						xl={3}
						alignItems='stretch'
						className={classes.buttons}
					>
						<Grid
							container
							direction='column'
							alignItems='stretch'
							justify='space-between'
						>
							<Box p={2}>
								<div className={classes.adexLogoTop}>
									<Logo className={classes.logo} />
								</div>
							</Box>
							<Box p={2}>
								<AuthSelect {...rest} />
							</Box>
							<Box
								p={2}
								display='flex'
								flexDirection='column'
								alignItems='center'
								flexWrap='wrap'
							>
								<Anchor
									className={classes.adxLink}
									target='_blank'
									href='https://medium.com/adex-network-tips-and-tricks'
								>
									{t('HELP')}
								</Anchor>
								<small className={classes.adxVersion}>
									{`v.${packageJson.version}-beta`}
								</small>
							</Box>
						</Grid>
					</Grid>
				</Grid>
			</div>
		)
	}

	return withStyles(styles)(Connect)
}
