import { saveCDR } from './../dal/CDRDAO'
import { findCompanyByID } from './../dal/CompanyDAO'
import path from 'path'
import { config } from '../config'
import {
  findDocumentByFilename,
  validateAndRecordDocument
} from '../dal/DocumentDAO'
import { findFileCDRByDocumentID } from '../dal/FileDAO'
import {
  getFilenameExt,
  readZipArchive,
  readAndSaveCDR,
  validateCDR,
  moveCPETemp2FinalPath
} from '../utils/files'
import { validateCorrectJsonInvoice } from '../utils/validateContentFile'
import { parseXmlToJson, parseXmlToJsonFromPath } from '../utils/xml'
import { getCDRFromSUNAT } from '../dal/CDRDAO'
import { decodeValue } from '../utils/cypher'
import { findContributorByID } from '../dal/ContributorDAO'

interface IGetAndSaveCDR {
  fileName: string
  isValid: boolean
  email?: string
  companyName?: string
  observationError?: string
}

// Funcion para validar contenido de los archivos de correo
export const getAndSaveCDR = async (
  filepaths: string[],
  prefix: string
): Promise<IGetAndSaveCDR | undefined> => {
  // Busca el CPE en la lista de archivos
  const invoiceIndex = filepaths.findIndex(
    (filepath) => getFilenameExt(filepath) !== '' && !filepath.includes('CDR')
  )
  // Separa el CPE de la lista de archivos
  const invoicePath = filepaths[invoiceIndex]

  // Valida que el CPE sea un archivo xml
  if (invoicePath == null) {
    console.log(prefix, 'No se encontró file xml')
    return
  }

  // Se pasa a formato json el CPE
  const jsonInvoice: any = await parseXmlToJsonFromPath(invoicePath, prefix)
  if (jsonInvoice == null) {
    console.log('*   File no encontrado')
    return
  }

  // Valida que el CPE sea un CPE válido
  const validatedStructure = validateCorrectJsonInvoice(jsonInvoice)
  if (!validatedStructure) {
    console.log(prefix, 'Comprobante incorrecto!')
    return
  }

  // Consume el API de Ratifika para guardar o actualizar el CPE
  const data = await validateAndRecordDocument(jsonInvoice, prefix)
  if (data == null) {
    return
  }

  if (data.fileName == null) {
    return
  }
  const document = await findDocumentByFilename(data.fileName)

  if (document == null) {
    console.log(
      `${prefix}El servicio de ratifika no registró el documento por que ${
        data.stateDocDesc !== undefined ? data.stateDocDesc : ''
      }`
    )
    return
  }
  console.log(
    prefix,
    `Documento ${document?.serie != null ? document?.serie : ''}-${
      document?.number != null ? document?.number : ''
    } guardado`
  )

  // Se adelanta el guardado en file
  if (document?.emitterCompanyId != null) {
    const company = await findCompanyByID(document?.emitterCompanyId)
    // El CDR fue generado por Ratifika
    console.log(prefix, 'El xml ya fue procesado en Ratifika')
    // Si el CDR fue generado en Ratifika, se obtiene el CDR
    const cdrFile = await findFileCDRByDocumentID(document.id)
    if (cdrFile != null) {
      // Se encontro CDR en la BD
      const fullPath = path.join(config.finalFolder, cdrFile.fileName)
      const xmlCDR = readZipArchive(fullPath)
      const json = await parseXmlToJson(xmlCDR)

      const savedCDR = await readAndSaveCDR(
        json,
        document?.emitterCompanyId,
        document?.emitterContributorId,
        document?.id,
        cdrFile?.id
      )
      const objReturn: IGetAndSaveCDR = {
        fileName: invoicePath,
        isValid: validateCDR(json),
        email: company?.emailAddress,
        companyName: company?.legalName,
        observationError: savedCDR.observationDescription
      }
      return objReturn
    } else {
      // No se encontro CDR en la BD
      console.log(
        prefix,
        'No se encontró CDR del documento, consultando SUNAT...'
      )
      if (company?.userSol != null && company?.claveSol != null) {
        const cdrSUNAT = await getCDRFromSUNAT(
          company.userSol,
          decodeValue(company.claveSol),
          String(company.number),
          document.documentType,
          document.serie,
          Number(document.number),
          document.id
        )

        if (cdrSUNAT.statusCode === '0004' && cdrSUNAT.xml !== undefined) {
          const xmlCDR = cdrSUNAT.xml
          const json = await parseXmlToJson(xmlCDR)
          const savedCDR = await readAndSaveCDR(
            json,
            document?.emitterCompanyId,
            document?.emitterContributorId,
            document?.id,
            cdrSUNAT?.fileId
          )
          await moveCPETemp2FinalPath(
            String(company.number),
            document.documentType,
            document.serie,
            Number(document.number),
            invoicePath
          )
          const objReturn: IGetAndSaveCDR = {
            fileName: invoicePath,
            isValid: validateCDR(json),
            email: company?.emailAddress,
            companyName: company?.legalName,
            observationError: savedCDR.observationDescription
          }
          return objReturn
        } else {
          console.log(
            prefix,
            'Error consultando SUNAT, Codigo: ',
            cdrSUNAT.statusCode,
            'Mensaje: ',
            cdrSUNAT.statusMessage
          )
          await saveCDR(
            'Error consultando SUNAT, Codigo:' +
              String(cdrSUNAT.statusCode) +
              'Mensaje:' +
              cdrSUNAT.statusMessage,
            undefined,
            undefined,
            undefined,
            undefined,
            document.id
          )
        }
      } else {
        console.log(prefix, 'No se encontró usuario y contraseña sol de SUNAT')
      }
    }
  } else {
    console.log(
      prefix,
      'El documento se generó de manera externa, consultando SUNAT...'
    )
    const reciver = await findCompanyByID(document.receiverId)
    let email
    let companyName
    if (document.emitterContributorId != null) {
      const contributor = await findContributorByID(
        document.emitterContributorId
      )
      if (process.env.NODE_ENV === 'production') {
        email = contributor != null ? contributor.emailAddress : ''
        companyName = contributor != null ? contributor.legalName : ''
      }
    }

    if (reciver?.userSol != null && reciver?.claveSol != null) {
      const cdrSUNAT = await getCDRFromSUNAT(
        reciver?.userSol,
        decodeValue(reciver?.claveSol),
        String(reciver?.number),
        document.documentType,
        document.serie,
        Number(document.number),
        document.id
      )
      if (cdrSUNAT.statusCode === '0004' && cdrSUNAT.xml !== undefined) {
        const xmlCDR = cdrSUNAT.xml
        const json = await parseXmlToJson(xmlCDR)
        const savedCDR = await readAndSaveCDR(
          json,
          document?.emitterCompanyId,
          document?.emitterContributorId,
          document?.id,
          cdrSUNAT?.fileId
        )
        await moveCPETemp2FinalPath(
          String(reciver?.number),
          document.documentType,
          document.serie,
          Number(document.number),
          invoicePath
        )
        const objReturn: IGetAndSaveCDR = {
          fileName: invoicePath,
          isValid: validateCDR(json),
          email,
          companyName,
          observationError: savedCDR.observationDescription
        }

        return objReturn
      } else {
        console.log(
          prefix,
          'Error consultando SUNAT, Codigo: ',
          cdrSUNAT.statusCode,
          'Mensaje: ',
          cdrSUNAT.statusMessage
        )
        await saveCDR(
          'Error consultando SUNAT, Codigo:' +
            String(cdrSUNAT.statusCode) +
            'Mensaje:' +
            cdrSUNAT.statusMessage,
          undefined,
          undefined,
          undefined,
          undefined,
          document.id
        )
      }
    } else {
      console.log(
        prefix,
        'No se encontró usuario y contraseña sol de SUNAT en la empresa receptor',
        reciver?.legalName
      )
    }
  }
}
