import React from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Hidden from '@material-ui/core/Hidden'
import Anchor from 'components/common/anchor/anchor'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import AuthSelect from 'components/signin/auth-select/AuthSelect'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { t } from 'selectors'
import { Typography } from '@material-ui/core'
import ThemeSwitch from 'components/App/ThemeSwitch'

export default function ConnectHoc(Decorated) {
	function Connect({ classes, ...rest }) {
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
								<Hidden mdUp>
									<Box display='flex' justifyContent='center'>
										<ArrowDropDownIcon color='primary' fontSize='large' />
									</Box>
								</Hidden>
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} md={5} lg={4} xl={3}>
						<Box
							display='flex'
							flexDirection='column'
							alignItems='stretch'
							justifyContent='space-between'
							style={{ height: '100%' }}
						>
							<Box p={4} alignItems='center'>
								<ThemeSwitch />
								<Typography align='center' variant='h3'>
									{t('Log in')}
								</Typography>
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
									href={`${process.env.ADEX_HELP_URL}`}
								>
									{t('HELP')}
								</Anchor>
								<small className={classes.adxVersion}>
									{`v.${packageJson.version}-beta`}
								</small>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</div>
		)
	}

	return withStyles(styles)(Connect)
}
