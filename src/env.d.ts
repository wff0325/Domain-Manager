/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly USER: string
    readonly PASS: string
    readonly VITE_API_TOKEN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 