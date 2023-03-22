import { hoy } from './date'
import { saveCDR } from './../dal/CDRDAO'
import path from 'path'
import fs from 'fs'
import { validFileAttachmentDefault } from '../constants/types'
import { toUpper } from './string'
import { Base64Decode } from 'base64-stream'
import { config } from '../config'
import unzipper from 'unzipper'
import AdmZip from 'adm-zip'
import moment from 'moment-timezone'
import cdrDTO from '../dto/cdrDTO'
import { saveCDRFile } from '../dal/FileDAO'
import FileDTO from '../dto/FileDTO'

// Optiene la extensión del archivo
export const getFilenameExt = (filename: string): string => {
  return path.extname(filename).replace('.', '')
}

// Función validadora del tipo de archivo
export const validateAttachmentTypeFile = (
  filename: string,
  validTypesToValidate: string[] = validFileAttachmentDefault
): boolean => {
  const type = getFilenameExt(filename)
  const isValid = validTypesToValidate?.includes(type)
  return isValid
}

// Guarda los archivos provenientes de los correos en la carpeta temporal
export const writeStream = async (
  stream: any,
  filename: string,
  encoding: string,
  directory: string
): Promise<string[]> => {
  const pathDirectory = path.join(config.tempFolder, directory)
  await createDirectory(pathDirectory)
  const finalPath = path.join(pathDirectory, filename)
  return await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(finalPath)
    writeStream.on('finish', function (): void {
      let response: string[] = []
      if (getFilenameExt(filename) === 'zip') {
        decompressZipFile(finalPath, directory)
          .then((filenames: string[]) => {
            response = filenames
            resolve(response)
          })
          .catch((error: Error) => {
            console.error(error)
            resolve(response)
          })
      } else {
        response = [finalPath]
        resolve(response)
      }
    })
    if (toUpper(encoding) === 'BASE64') {
      stream.pipe(new Base64Decode()).pipe(writeStream)
    } else {
      stream.pipe(writeStream)
    }
  })
}

// Función que se encarga de descomprimir un archivo zip y guardar los archivos descomprimidos
const decompressZipFile = async (
  zipPath: string,
  ruc: string
): Promise<string[]> => {
  const promises: any[] = []
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Parse())
    .on('entry', (entry: any) => {
      const filename = entry.path
      if (validateAttachmentTypeFile(filename)) {
        promises.push(
          new Promise((resolve, reject) => {
            const pathDirectory = path.join(config.tempFolder, ruc)
            createDirectory(pathDirectory)
              .then(() => {
                const fullPath = path.join(pathDirectory, filename)
                const writeStream = fs.createWriteStream(fullPath)
                entry.pipe(writeStream)
                writeStream.on('finish', () => {
                  resolve(fullPath)
                })
              })
              .catch((err) => {
                console.log(err)
                reject(err)
              })
          })
        )
      } else {
        entry.autodrain()
      }
    })
    .promise()

  const filenames: string[] = await Promise.all(promises)
  return filenames
}

// Método para validar si lista de attachments tiene un xml
export const containsCPEptXml = (files: any[]): boolean => {
  return (
    files.findIndex(
      (filename: string) =>
        (getFilenameExt(filename) === 'xml' ||
          getFilenameExt(filename) === 'XML') &&
        !(filename.includes('CDR') || filename.includes('R-'))
    ) !== -1
  )
}

// Validar si existe el directorio
export const validateDirectory = (pathToValidate: string): boolean => {
  return fs.existsSync(pathToValidate)
}

// crea el directorio
export const makeDir = async (pathDirectory: string): Promise<boolean> => {
  return await new Promise((resolve) => {
    try {
      fs.mkdir(pathDirectory, (err) => {
        if (err != null) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    } catch (error) {
      resolve(false)
    }
  })
}

interface CreateDirectoryResponse {
  created: boolean
  success: boolean
}

// Crear Directorio si no existe
export const createDirectory = async (
  path: string
): Promise<CreateDirectoryResponse> => {
  const response: CreateDirectoryResponse = {
    created: false,
    success: true
  }

  try {
    const fullPath = path
    const pathExist = validateDirectory(fullPath)

    !pathExist && (response.created = await makeDir(fullPath))
  } catch (error) {
    response.success = false
  }

  return response
}

export const readZipArchive = (filepath: string): string => {
  const zip = new AdmZip(filepath)

  const entryInvoice = zip.readAsText(zip.getEntries()[0])

  return entryInvoice
}

export const parseBase64 = (base64: string): string => {
  return Buffer.from(base64, 'base64').toString('utf8')
}

export const readAndSaveCDR = async (
  jsonCDR: any,
  emitterCompanyId?: number,
  emitterContributorId?: number,
  documentId?: number,
  fileId?: number
): Promise<cdrDTO> => {
  const responseDescription =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:Response'
    ]?.['cbc:Description']?._text
  const observationCode =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:Response'
    ]?.['cac:Status']?.['cbc:StatusReasonCode']?._text != null
      ? jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
        'cac:Response'
      ]?.['cac:Status']?.['cbc:StatusReasonCode']?._text
      : jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
        'cac:Response'
      ]?.['cac:Status']?.['cbc:StatusReasonCode']?._attributes?.listURI
  const observationDescription =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:Response'
    ]?.['cac:Status']?.['cbc:StatusReason']?._text
  const emissionDate =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:DocumentReference'
    ]?.['cbc:IssueDate']?._text
  const emissionTime =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:DocumentReference'
    ]?.['cbc:IssueTime']?._text
  const billHash =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:DocumentReference'
    ]?.['cac:Attachment']?.['cac:ExternalReference']?.['cbc:DocumentHash']
      ?._text
  const date =
    emissionDate != null && emissionTime != null
      ? moment(`${String(emissionDate)} ${String(emissionTime)}`)
        .tz(config.tz)
        .format('YYYY-MM-DD HH:mm:ss')
      : undefined
  await saveCDR(
    responseDescription,
    observationCode,
    observationDescription,
    date,
    billHash,
    documentId,
    fileId,
    emitterCompanyId,
    emitterContributorId
  )
  return {
    responseDescription,
    observationCode,
    observationDescription,
    dateEmission: date,
    billHash,
    documentId,
    fileId,
    emitterContributorId,
    emitterCompanyId
  }
}

// Valida si el CPE ha sido validado por SUNAT a traves del CDR
export const validateCDR = (jsonCDR: any): boolean => {
  /* /ApplicationResponse/cac:DocumentResponse/cac:Response/cbc:ResponseCode */
  /* /ApplicationResponse/cac:DocumentResponse/cac:Response/cbc:ResponseCode/@listAgencyName */
  const responseCode =
    jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
      'cac:Response'
    ]?.['cbc:ResponseCode']?._text != null
      ? jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
        'cac:Response'
      ]?.['cbc:ResponseCode']?._text
      : jsonCDR?.['ar:ApplicationResponse']?.['cac:DocumentResponse']?.[
        'cac:Response'
      ]?.['cbc:ResponseCode']?._attributes?.listAgencyName

  return responseCode === '0'
}

// Crea las carpetas de ruc y fecha si no existen
export const createPathRucDate = async (
  ruc: string,
  date: string
): Promise<string> => {
  const pathRuc = path.join(config.finalFolder, ruc)
  const validateRuc = validateDirectory(pathRuc)
  if (!validateRuc) {
    await createDirectory(pathRuc)
    const pathDate = path.join(pathRuc, date)
    const validateDate = validateDirectory(pathDate)
    if (!validateDate) {
      await createDirectory(pathDate)
    }
  } else {
    const pathDate = path.join(pathRuc, date)
    const validateDate = validateDirectory(pathDate)
    if (!validateDate) {
      await createDirectory(pathDate)
    }
  }
  return path.join(pathRuc, date)
}

export const saveCDRFromSunat = async (
  ruc: string,
  tipoDocumento: string,
  serie: string,
  numero: number,
  base64Data: string,
  documentId: number
): Promise<FileDTO | null> => {
  const date = hoy('DD-MM-YYYY')
  const pathRucDate = await createPathRucDate(ruc, date)
  const filename = `${Date.now()}_CDR_${ruc}-${tipoDocumento}-${serie}-${numero}.zip`
  const finalPath = path.join(pathRucDate, filename)
  fs.writeFileSync(finalPath, base64Data, 'base64')
  const filenameToSave = `${ruc}/${date}/${filename}`
  const file = await saveCDRFile(documentId, filenameToSave)
  return file
}

export const moveCPETemp2FinalPath = async (
  ruc: string,
  tipoDocumento: string,
  serie: string,
  numero: number,
  tempPath: string
): Promise<void> => {
  const zip = new AdmZip()
  zip.addLocalFile(tempPath)
  const date = hoy('DD-MM-YYYY')
  const pathRucDate = await createPathRucDate(ruc, date)
  const filename = `${Date.now()}_${ruc}-${tipoDocumento}-${serie}-${numero}.zip`
  const finalPath = path.join(pathRucDate, filename)
  zip.writeZip(finalPath)
}
