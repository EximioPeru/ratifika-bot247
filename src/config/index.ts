/* const _build_XOAuth2_token = (user = '', access_token = ''): string => Buffer
  .from([`user=${user}`, `auth=Bearer ${access_token}`, '', '']
    .join('\x01'), 'utf-8')
  .toString('base64')

  xoauth2: _build_XOAuth2_token(process.env.IMAP_USER, 'eyJ0eXAiOiJKV1QiLCJub25jZSI6ImZBaFgtakxLT2xTRE1PblRvRG5UbHIxVmM4SVpRcFhrOEQzQWNwX0t1YW8iLCJhbGciOiJSUzI1NiIsIng1dCI6IjJaUXBKM1VwYmpBWVhZR2FYRUpsOGxWMFRPSSIsImtpZCI6IjJaUXBKM1VwYmpBWVhZR2FYRUpsOGxWMFRPSSJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlMzY1LmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzI4NmI1M2FiLWFmYzItNDA3Yy1hYzIzLTQ1ODFjYmE0OWEyNC8iLCJpYXQiOjE2Njg5NzIzMTUsIm5iZiI6MTY2ODk3MjMxNSwiZXhwIjoxNjY4OTc2MjE1LCJhaW8iOiJFMlpnWUtpK25acDc2ZDRMN1FzRjZnOTVMYXc1QUE9PSIsImFwcF9kaXNwbGF5bmFtZSI6IklNQVBPYXV0aCIsImFwcGlkIjoiN2JjOGM1OTItOTE2MS00ZGFlLThlMjAtMzhiYTk0YjI0YzdkIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjg2YjUzYWItYWZjMi00MDdjLWFjMjMtNDU4MWNiYTQ5YTI0LyIsIm9pZCI6IjdjNjQ2ZGY2LTY5MDMtNDkwOC1hN2JlLWI3YjEzNGQ5OTExNiIsInJoIjoiMC5BWDBBcTFOcktNS3ZmRUNzSTBXQnk2U2FKQUlBQUFBQUFQRVB6Z0FBQUFBQUFBQ2NBQUEuIiwic2lkIjoiYzE1NDg4NzMtNGY5MS00ZDUyLTg3NjUtNjViYzNiMDVjZDViIiwic3ViIjoiN2M2NDZkZjYtNjkwMy00OTA4LWE3YmUtYjdiMTM0ZDk5MTE2IiwidGlkIjoiMjg2YjUzYWItYWZjMi00MDdjLWFjMjMtNDU4MWNiYTQ5YTI0IiwidXRpIjoiY3BqM0dRb2c5VS1MbXJLMEJtdHVBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMDk5N2ExZDAtMGQxZC00YWNiLWI0MDgtZDVjYTczMTIxZTkwIl19.ITEai6j9XABR1zh7t2tUwgncu2hqJs8hIuMd2CzODhBEhckjmBjyo6fnsLKB0KwJDHVw4PwP0_y_axEqvIwg0DvRxuJEQFwYL8_bUUhwFf3_4LChcJoj6Z9v3LzdzqVYEez4fj6TKzP7uMp3rndLMOq6VlF0ooCz9_R2hDkuembYclosMxi_TDRqJUvNicnXDU2otZ19ylPnUqL91FRZfSgQfj1hTDsAyCXPj8nMnb6Jl6FPdiiKfAP_3PAMo719p_UtcbwgFHlNGDQwAFhixGHhcMnfICkb4oQaH_T3fJWqk2dE1Ru35_j7X4UItYZxeY3F0AQ8VHeghEqFhWE-Jw'),
 */

// Config para IMAP
export const imapConfig: any = {
  user: undefined,
  password: undefined,
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT),
  tls: true,
  authTimeout: 25000,
  connTimeout: 30000,
  keepalive: {
    idleInterval: 180000
  },
  tlsOptions: {
    rejectUnauthorized: false,
    servername: process.env.IMAP_HOST
  }
}

if (imapConfig.host == null) {
  throw new Error('IMAP_HOST is not defined')
}

if (imapConfig.port == null) {
  throw new Error('IMAP_PORT is not defined')
}

// Config para SMTP
export const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: String(process.env.SMTP_USER),
    pass: String(process.env.SMTP_PASSWORD)
  }
}

if (smtpConfig.host == null) {
  throw new Error('SMTP_HOST is not defined')
}

if (smtpConfig.port == null) {
  throw new Error('SMTP_PORT is not defined')
}

if (smtpConfig.auth.user == null) {
  throw new Error('SMTP_USER is not defined')
}

if (smtpConfig.auth.pass == null) {
  throw new Error('SMTP_PASSWORD is not defined')
}

// Config para Base de datos

export const databaseConfig = {
  username: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASSWORD),
  host: String(process.env.DB_HOST),
  port: Number(process.env.DB_PORT),
  database: String(process.env.DB_NAME),
  sslMode: String(process.env.DB_SSL_MODE)
}

if (databaseConfig.username == null) {
  throw new Error('DB_USERNAME is not defined')
}

if (databaseConfig.password == null) {
  throw new Error('DB_PASSWORD is not defined')
}

if (databaseConfig.host == null) {
  throw new Error('DB_HOST is not defined')
}

if (databaseConfig.port == null) {
  throw new Error('DB_PORT is not defined')
}

if (databaseConfig.database == null) {
  throw new Error('DB_NAME is not defined')
}

if (databaseConfig.sslMode == null) {
  throw new Error('DB_SSL_MODE is not defined')
}

// Config para integración con Office365

export const office365Config = {
  clientId: String(process.env.OFFICE365_CLIENT_ID),
  clientSecret: String(process.env.OFFICE365_CLIENT_SECRET),
  tenantId: String(process.env.OFFICE365_TENANT_ID),
  user: String(process.env.OFFICE365_USER)
}

if (office365Config.clientId == null) {
  throw new Error('OFFICE365_CLIENT_ID is not defined')
}

if (office365Config.clientSecret == null) {
  throw new Error('OFFICE365_CLIENT_SECRET is not defined')
}

if (office365Config.tenantId == null) {
  throw new Error('OFFICE365_TENANT_ID is not defined')
}

if (office365Config.user == null) {
  throw new Error('OFFICE365_USER is not defined')
}

// API Ratifika
export const configAPIRatifika = {
  urlValidationXML: String(process.env.URL_VALIDATION_XML)
}

if (configAPIRatifika.urlValidationXML == null) {
  throw new Error('URL_VALIDATION_XML is not defined')
}

// API SUNAT
export const configAPISUNAT = {
  urlCDR: String(process.env.URL_BILL_SUNAT),
  username: String(process.env.DEFAULT_USERNAME),
  password: String(process.env.DEFAULT_CLAVESOL),
  rucComprobante: String(process.env.RUC_COMPROBANTE),
  tipoComprobante: String(process.env.TIPO_COMPROBANTE),
  serieComprobante: String(process.env.SERIE_COMPROBANTE),
  numeroComprobante: Number(process.env.NUMERO_COMPROBANTE)
}

if (configAPISUNAT.urlCDR == null) {
  throw new Error('URL_BILL_SUNAT is not defined')
}

// Otras configuraciones
export const config = {
  tz: String(process.env.TZ),
  tempFolder: String(process.env.TEMP_FOLDER),
  finalFolder: String(process.env.FINAL_FOLDER),
  secretCipher: String(process.env.CIPHER_SECRET)
}

if (config.tz == null) {
  throw new Error('TZ is not defined')
}

if (config.tempFolder == null) {
  throw new Error('TEMP_FOLDER is not defined')
}

if (config.finalFolder == null) {
  throw new Error('FINAL_FOLDER is not defined')
}
