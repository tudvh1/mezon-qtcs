export interface EnvironmentVariables {
  nodeEnv: string
  app: {
    port: number
    apiUrl: string
  }
  database: {
    host: string
    port: number
    name: string
    user: string
    password: string
    autoMigration: boolean
  }
  mezon: {
    token: string
  }
  puppeteer: {
    chromiumPath: string
  }
}

export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`
    }[keyof T]
  : never

export type LeafTypes<T, S extends string> = S extends `${infer T1}.${infer T2}`
  ? T1 extends keyof T
    ? LeafTypes<T[T1], T2>
    : never
  : S extends keyof T
    ? T[S]
    : never

export type Paths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Paths<T[K]>}`}` }[keyof T]
  : never

export type PathTypes<T, S extends string> = S extends `${infer T1}.${infer T2}`
  ? T1 extends keyof T
    ? PathTypes<T[T1], T2>
    : never
  : S extends keyof T
    ? T[S]
    : never
