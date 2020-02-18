import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Card, Typography, TextField } from '@material-ui/core'
import { execute, updateCompanyData } from 'actions'
import { t, selectCompanyData } from 'selectors'

function CompanyDetails(props) {
	const { companyName, firstLastName, address, country } = useSelector(state =>
		selectCompanyData(state)
	)

	return (
		<Box mb={3} mt={3}>
			<Box mb={1}>
				<Typography variant='h4'>{'Company Details'}</Typography>
			</Box>
			<Card>
				<Box p={3}>
					<TextField
						label={t('COMPANY_NAME')}
						value={companyName || ''}
						onChange={ev =>
							execute(updateCompanyData({ companyName: ev.target.value }))
						}
						fullWidth
					/>
					<TextField
						label={t('FIRST_LAST_NAME')}
						value={firstLastName || ''}
						onChange={ev =>
							execute(updateCompanyData({ firstLastName: ev.target.value }))
						}
						fullWidth
					/>
					<TextField
						label={t('ADDRESS')}
						value={address || ''}
						onChange={ev =>
							execute(updateCompanyData({ address: ev.target.value }))
						}
						fullWidth
					/>
					<TextField
						label={t('COUNTRY')}
						value={country || ''}
						onChange={ev =>
							execute(updateCompanyData({ country: ev.target.value }))
						}
						fullWidth
					/>
					{props.children}
				</Box>
			</Card>
		</Box>
	)
}

export default CompanyDetails
