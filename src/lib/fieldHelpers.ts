const firstIndexOf = (str: string, searchKeys: string[], start: number) => (
    searchKeys.reduce((acc, key) => {
        const next = str.indexOf(key, start)
        if (next === -1) {
            return acc
        }
        return Math.min(acc, next)
    }, Infinity)
)

const matchingNestChar = {
    '(': ')',
    '[': ']'
}
const nestStartChars = Object.keys(matchingNestChar)
const nestEndChars = Object.values(matchingNestChar)
const tokenBreakChars = [',', ...nestStartChars, ...nestEndChars]

const nextToken = (str: string, start: number) => {
    const nextIndex = firstIndexOf(str, tokenBreakChars, start)
    if (nextIndex === Infinity) {
        return {
            token: str.substring(start),
            nextChar: null
        }
    }
    return {
        token: str.substring(start, nextIndex),
        nextChar: str[nextIndex]
    }
}

export const parseColumns = (fields: string, firstResult: object) => {
    if (fields === '*' || fields.startsWith(':')) {
        return getAvailablePaths(firstResult, 1)
    }
    
    const columns = []
    let i = 0
    while (i < fields.length) {
        const { token, nextChar } = nextToken(fields, i)
        i += token.length

        if (nestStartChars.includes(nextChar)) {
            let end = fields.indexOf(matchingNestChar[nextChar], i+1)
            if (end === -1) {
                throw new Error(`Missing closing bracket for opening bracket at position ${i}`)
            }
            columns.push(...parseColumns(fields.substring(i+1, end), firstResult[token]).map(column => `${token}.${column}`))
            i = end + 1
        } else if (nestEndChars.includes(nextChar)) {
            throw new Error(`Unexpected closing bracket at position ${i}`)
        } else {
            columns.push(token)
            i += 1
        }
    }
    return columns
}

export const getPropertyByPath = (object: object, path: string) => {
    if (!object || typeof object !== 'object') {
        return object
    }

    let res = object
    const parts = path.split('.')
    for (const key of parts) {
        res = res[key]
        if (!res) {
            return res
        }
    }
    return res
}

export const getAvailablePaths = (object: object, maxDepth: number): string[] => {
    if (!object || typeof object !== 'object') {
        return []
    }
    const paths = []
    
    let current = object
    for (const key of Object.keys(object)) {
        if (typeof current[key] === 'object' && maxDepth > 1) {
            paths.push(...getAvailablePaths(current[key], maxDepth - 1).map(path => `${key}.${path}`))
        } else {
            paths.push(key)
        }
    }

    return paths
}