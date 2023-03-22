import { executeQueryPlain } from './../utils/database'
import FileDTO from '../dto/FileDTO'
import FileMap from '../mappers/FileMap'
import { getDate } from '../utils/date'

export const findFileCDRByDocumentID = async (
  documentID: number
): Promise<FileDTO | null> => {
  const query =
    "select id, document_id, file_name, file_type from files where document_id = ? and file_type = 'cdr' ORDER BY id desc LIMIT 1"
  const params = [documentID]
  const result = await executeQueryPlain<FileDTO>(query, params)
  if (result == null) {
    return null
  }
  const file = FileMap.toDTO(result)
  return file
}

export const saveCDRFile = async (documentId: number, filename: string): Promise<FileDTO | null> => {
  await saveFile(documentId, 'cdr', filename)
  return await findFileCDRByDocumentID(documentId)
}

export const saveFile = async (documentId: number, fileType: string, filename: string): Promise<void> => {
  const query =
    'insert into files (document_id, file_type, file_name, created_at, updated_at) values (?, ?, ?, ?, ?)'
  const params = [
    documentId,
    fileType,
    filename,
    getDate(),
    getDate()
  ]
  await executeQueryPlain(query, params)
}
