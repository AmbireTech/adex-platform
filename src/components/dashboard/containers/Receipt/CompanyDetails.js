import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper, Typography, TextField, Grid } from '@material-ui/core'
import { execute, updateCompanyData } from 'actions'
import { t, selectCompanyData } from 'selectors'

function CompanyDetails(props) {
	const { companyName, firstLastName, address, country } = useSelector(
		selectCompanyData
	)

	return (
		<Box mb={1}>
			<Paper variant='outlined'>
				<Box p={2}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography gutterBottom variant='h5'>
								{t('COMPANY_DETAIL_HEADING')}
							</Typography>
						</Grid>
						<Grid item xs={12} lg={6}>
							<TextField
								label={t('COMPANY_NAME')}
								value={companyName || ''}
								onChange={ev =>
									execute(updateCompanyData({ companyName: ev.target.value }))
								}
								fullWidth
								variant='outlined'
							/>
						</Grid>

						<Grid item xs={12} lg={6}>
							<TextField
								label={t('FIRST_LAST_NAME')}
								value={firstLastName || ''}
								onChange={ev =>
									execute(updateCompanyData({ firstLastName: ev.target.value }))
								}
								fullWidth
								variant='outlined'
							/>
						</Grid>

						<Grid item xs={12} lg={6}>
							<TextField
								label={t('ADDRESS')}
								value={address || ''}
								onChange={ev =>
									execute(updateCompanyData({ address: ev.target.value }))
								}
								fullWidth
								variant='outlined'
							/>
						</Grid>

						<Grid item xs={12} lg={6}>
							<TextField
								label={t('COUNTRY')}
								value={country || ''}
								onChange={ev =>
									execute(updateCompanyData({ country: ev.target.value }))
								}
								fullWidth
								variant='outlined'
							/>
						</Grid>

						<Grid item xs={12}>
							{props.children}
						</Grid>
					</Grid>
				</Box>
			</Paper>
		</Box>
	)
}

export default CompanyDetails
