import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

export function useTableData(selector, selectorArgs) {
	const [data, setData] = useState([])

	const selectedData = useSelector(state => selector(state, selectorArgs))

	useEffect(() => {
		setData(selectedData)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedData.length])

	return data
}
