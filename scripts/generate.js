const { execSync } = require('node:child_process')

const url = `${process.env.NEXT_PUBLIC_API_URL}/api/docs/openapi.json`

execSync(`bunx openapi-typescript "${url}" -o src/types/api.d.ts`, {
    stdio: 'inherit'
})
execSync(`bunx openapi-to-zod -i "${url}" -o src/validations -x ts`, {
    stdio: 'inherit'
})
