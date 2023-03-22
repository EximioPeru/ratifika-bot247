import { configAPIRatifika } from './../config/index'
import DocumentDTO from '../dto/DocumentDTO'
import { executeQueryPlain } from '../utils/database'
import axios from 'axios'
import ResponseValidateAnonymousDTO from '../dto/ResponseValidateAnonymousDTO'
import ResponseValidateAnonymouseMap from '../mappers/ResponseValidateAnonymouseMap'
import DocumentMap from '../mappers/DocumentMap'

export const findDocumentByFilename = async (
  filename: string
): Promise<DocumentDTO | null> => {
  try {
    const result = await executeQueryPlain<DocumentDTO>(
      'select id,emitter_contributor_id, receiver_id, emitter_company_id, serie, number, document_type, file_name from documents where file_name IS NOT NULL AND file_name = ? and state = 1',
      [filename]
    )
    console.log(result)
    if (result == null) return null
    return DocumentMap.toDTO(result)
  } catch (error) {
    console.log(error)
    return null
  }
}

export const validateAndRecordDocument = async (
  jsonInvoice: Object,
  prefix: string
): Promise<ResponseValidateAnonymousDTO | null> => {
  const { data, status } = await axios.post(
    configAPIRatifika.urlValidationXML,
    {
      document: jsonInvoice,
      origin: 'MAIL'
    }
  )

  if (status !== 200 || data?.result !== true) {
    return null
  }
  return ResponseValidateAnonymouseMap.toDTO(data)
}
