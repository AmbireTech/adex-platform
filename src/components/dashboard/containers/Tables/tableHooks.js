import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'

export function useTableData({ selector, selectorArgs, getColumns }) {
	const [data, setData] = useState([])
	const [columns, setColumns] = useState([])

	const selectedData = useSelector(state => selector(state, selectorArgs))

	const reloadData = useCallback(() => {
		setData(selectedData)
		setColumns(getColumns())
	}, [getColumns, selectedData])

	useEffect(() => {
		reloadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedData, selector, selectorArgs])

	return { data, columns, reloadData }
}
