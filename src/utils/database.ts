import Database from '../config/database'

export const executeQueryMany = async <T>(
  query: string,
  params?: Object | string[]
): Promise<T[]> => {
  return await new Promise((resolve, reject) => {
    const db = Database.getConnection()
    db.query(
      {
        sql: query,
        values: params
      },
      (error, results: T[], fields) => {
        if (error != null) {
          console.log('*    Query', query)
          console.log('*    Error al realizar la consulta ', error)
        } else {
          resolve(results)
        }
      }
    )
  })
}

export const executeQueryPlain = async <T>(
  query: string,
  params?: Object | string[]
): Promise<T | null> => {
  return await new Promise((resolve, reject) => {
    const db = Database.getConnection()
    db.query(
      {
        sql: query,
        values: params
      },
      (error, results: T[], fields) => {
        if (error != null) {
          console.log('*    Query', query)
          console.log('*    Error al realizar la consulta ', error)
        } else {
          resolve(results.length > 0 ? results[0] : null)
        }
      }
    )
  })
}
