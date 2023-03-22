import mysql, { Connection } from 'mysql2'
import { PoolOptions } from 'mysql2/typings/mysql'
import { databaseConfig } from '../config'

class Database {
  private static instance: Database
  private static connection: Connection
  private readonly connectionConfig: PoolOptions

  private constructor () {
    this.connectionConfig = {
      host: databaseConfig.host,
      user: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      port: databaseConfig.port
    }
    this.connect()
  }

  private connect (): void {
    const pool = mysql.createPool(this.connectionConfig)
    pool.getConnection(function (err, connection: Connection) {
      if (err != null) {
        console.log('*******************************')
        console.error('*    Ocurrió un  error', err)
        console.log('*******************************')
      }
      Database.connection = connection
    })
  }

  public static getInstance (): Database {
    if (Database.instance === undefined) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public static getConnection (): Connection {
    return Database.connection
  }
}

export default Database
