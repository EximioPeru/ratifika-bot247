import { executeQueryPlain } from './../utils/database'
import { getDate } from './../utils/date'
import { createSoapClient, callFunctionSoap } from './../utils/soap'
import { config, configAPISUNAT } from '../config'
import ResponseSunatCDRDTO from '../dto/ResponseSunatCDRDTO'
import path from 'path'
import fs from 'fs'
import { WSSecurity } from 'soap'
import { readZipArchive, saveCDRFromSunat } from '../utils/files'

export const getCDRFromSUNAT = async (
  username: string,
  claveSol: string,
  rucComprobante: string,
  tipoComprobante: string,
  serieComprobante: string,
  numeroComprobante: number,
  documentId: number
): Promise<ResponseSunatCDRDTO> => {
  const esDevelopment = process.env.NODE_ENV === 'development'
  const soapClient = await createSoapClient(configAPISUNAT.urlCDR)
  const wsSecurity = new WSSecurity(
    esDevelopment ? configAPISUNAT.username : username,
    esDevelopment ? configAPISUNAT.password : claveSol,
    {}
  )
  soapClient.setSecurity(wsSecurity)

  const response = await callFunctionSoap(
    soapClient,
    'billConsultService',
    'BillConsultServicePort',
    'getStatusCdr',
    {
      rucComprobante: esDevelopment
        ? configAPISUNAT.rucComprobante
        : rucComprobante,
      tipoComprobante: esDevelopment
        ? configAPISUNAT.tipoComprobante
        : tipoComprobante,
      serieComprobante: esDevelopment
        ? configAPISUNAT.serieComprobante
        : serieComprobante,
      numeroComprobante: esDevelopment
        ? configAPISUNAT.numeroComprobante
        : numeroComprobante
    }
  )
  if (response.statusCdr.statusCode === '0004') {
    // guardar cdr en la base de datos
    const file = await saveCDRFromSunat(
      rucComprobante,
      tipoComprobante,
      serieComprobante,
      numeroComprobante,
      response.statusCdr.content,
      documentId
    )

    if (file == null) {
      console.log('No se pudo guardar el cdr')
      return {
        statusCode: response.statusCdr.statusCode,
        statusMessage: response.statusCdr.statusMessage
      }
    }

    // abre cdr para obtener contenido
    const finalPath = path.join(config.finalFolder, file.fileName)
    const xmlCDR = readZipArchive(finalPath)

    return {
      xml: xmlCDR,
      statusCode: response.statusCdr.statusCode,
      statusMessage: response.statusCdr.statusMessage,
      filename: file.fileName,
      fileId: file.id
    }
  }
  return {
    statusCode: response.statusCdr.statusCode,
    statusMessage: response.statusCdr.statusMessage
  }
}

export const getCDRFromPath = async (fileName: string): Promise<any> => {
  const fullPath = path.join(config.finalFolder, fileName)
  const file = fs.readFileSync(fullPath, 'utf8')
  return file
}

export const saveCDR = async (
  responseDescription?: string,
  observationCode?: number,
  observationDescription?: string,
  dateEmission?: string,
  billHash?: string,
  documentId?: number,
  fileId?: number,
  emitterContributorId?: number,
  emitterCompanyId?: number
): Promise<void> => {
  const query =
    'insert into cdr (response_description, observation_code, observation_description, date_emission, bill_hash, document_id, file_id, created_at, updated_at, emitter_contributor_id,emitter_company_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  const values = [
    responseDescription,
    observationCode,
    observationDescription,
    dateEmission,
    billHash,
    documentId,
    fileId,
    getDate(),
    getDate(),
    emitterContributorId,
    emitterCompanyId
  ]
  await executeQueryPlain(query, values)
}
