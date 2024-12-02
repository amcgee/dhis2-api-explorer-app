import React, { useMemo } from 'react'
import { useDataEngine } from "@dhis2/app-runtime"
import { useQuery } from "@tanstack/react-query"
import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableFoot, DataTableHead, DataTableRow, Pagination } from '@dhis2/ui'
import styles from '../App.module.css'

export const GenericDataTable = ({ pager, data, columns, setPage }) => {
    return <DataTable className={styles.data_table}>
        <DataTableHead>
            <DataTableRow>
                {columns.map(column => <DataTableColumnHeader key={column}>{column}</DataTableColumnHeader>)}
            </DataTableRow>
        </DataTableHead>
        <DataTableBody>
            {data.map(row => <DataTableRow key={row.id}>
                {columns.map(column => <DataTableCell key={column}>{JSON.stringify(row[column])}</DataTableCell>)}
            </DataTableRow>)}
        </DataTableBody>
        <DataTableFoot>
            <div style={{ backgroundColor: 'white', borderTop: '2px whitesmoke solid', padding: '1rem', position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}><Pagination
                page={pager.page}
                pageCount={pager.pageCount}
                pageSize={pager.pageSize}
                total={pager.total}
                hidePageSizeSelect
                onPageChange={(page) => setPage(page)}
            /></div>
        </DataTableFoot>
    </DataTable>
}

const defaultPageSize = 10
const defaultFields = ['id', 'displayName']

export const ConnectedGenericDataTable = ({ url }: { url: string }) => {
    const [page, setPage] = React.useState(1)
    const [resource, params] = useMemo(() => {
        const parts = url.split('?')
        const [resource, params] = [parts[0], Object.fromEntries(new URLSearchParams(parts[1]))]
        setPage(parseInt(params.page) || 1)
        return [resource, params]
    }, [url])

    console.log(resource, params)
    const engine = useDataEngine()
    const { isLoading, error, data } = useQuery({
        queryKey: [resource, params, page],
        queryFn: () => engine.query({
            main: {
                resource,
                params: {
                    pageSize: defaultPageSize,
                    fields: defaultFields,
                    ...params,
                    paging: true,
                    page
                }
            }
        })
    })

    const firstObjectKeys = Object.keys(data?.main?.[resource]?.[0] || {})
    console.log(firstObjectKeys)

    const columns = params.fields === '*' || params.fields?.startsWith(':') ? firstObjectKeys : params.fields?.split(',') || ['id', 'displayName']
    return <>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {data && <GenericDataTable pager={(data.main as any).pager} setPage={setPage} data={data.main[resource]} columns={columns} />}
    </>
}