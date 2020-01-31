import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

export function useTableData({ selector, selectorArgs, getColumns }) {
	const [data, setData] = useState([])
	const [columns, setColumns] = useState([])

	const selectedData = useSelector(state => selector(state, selectorArgs))

	useEffect(() => {
		setData(selectedData)
		setColumns(getColumns())

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedData.length])

	return { data, columns }
}
