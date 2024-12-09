import React, { FC, useEffect } from 'react'
import { ConnectedGenericDataTable } from './components/GenericDataTable'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button, Input } from '@dhis2/ui'
import styles from "./App.module.css"
import { useConfig } from '@dhis2/app-runtime'
import { ScriptSandbox } from './components/ScriptSandbox'

const client = new QueryClient({ defaultOptions: { queries: { retry: false  } } })

const MyApp: FC = () => {
    const hashPath = window.location.hash?.substring(1)
    const [tempPath, setTempPath] = React.useState(hashPath || '')
    const [path, setPath] = React.useState(hashPath || undefined)
    const config = useConfig()

    useEffect(() => {
        const callback = () => {
            const hashPath = window.location.hash?.substring(1)
            setTempPath(hashPath)
            setPath(hashPath)
        }
        window.addEventListener('hashchange', callback)
        return () => window.removeEventListener('hashchange', callback)
    }, [])
    return <QueryClientProvider client={client}>
        <div className={styles.container}>
            <form onSubmit={e => {
                e.preventDefault()
                const sanitizedPath = tempPath.replace(/[?&]page=[0-9]+/g, '').replace(RegExp(`^${config.baseUrl}/api/(${config.apiVersion}/)?`), '')
                setTempPath(sanitizedPath)
                window.location.hash = sanitizedPath
                setPath(sanitizedPath)
            }}>
                <p style={{ color: 'gray'}}>{config.baseUrl}/api/{config.apiVersion}/</p>
                <Input placeholder="API Path" value={tempPath} onChange={({ value }) => setTempPath(value)} />
                <Button type="submit">Go</Button>
            </form>
            <div className="results">
                { path && <ConnectedGenericDataTable url={path} />}
            </div>
            {/* <ScriptSandbox script="console.log('SCRIPT!')" /> */}
        </div>
    </QueryClientProvider>
}

export default MyApp
