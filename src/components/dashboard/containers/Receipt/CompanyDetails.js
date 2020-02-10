import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Card, Typography } from '@material-ui/core'
import TextFieldDebounced from 'components/common/fields/TextFieldDebounced'
import { execute, updateCompanyData } from 'actions'
import { selectCompanyData } from 'selectors'

function CompanyDetails(props) {
	const { companyName, firstLastName, address, country } = useSelector(state =>
		selectCompanyData(state)
	)
	return (
		<Box mb={3}>
			<Box mb={1}>
				<Typography variant='h4'>{'Company Details'}</Typography>
			</Box>
			<Card>
				<Box p={3}>
					<TextFieldDebounced
						label={'Company Name'}
						value={companyName || ''}
						debounceChange={value =>
							execute(updateCompanyData({ companyName: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'First And Last Name'}
						value={firstLastName || ''}
						debounceChange={value =>
							execute(updateCompanyData({ firstLastName: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'Address'}
						value={address || ''}
						debounceChange={value =>
							execute(updateCompanyData({ address: value }))
						}
						fullWidth
					/>
					<TextFieldDebounced
						label={'Country'}
						value={country || ''}
						debounceChange={value =>
							execute(updateCompanyData({ country: value }))
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
