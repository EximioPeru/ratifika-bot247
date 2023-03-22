import 'dotenv/config'
import Database from './config/database'
import IMAPConnection from './config/imap'

// Conectar Base de datos
Database.getInstance()

// inicia la conexión IMAP
IMAPConnection.start()
  .then()
  .catch((err) => {
    console.log('*  Error al iniciar IMAP', err)
    console.log('*******************************')
  })
