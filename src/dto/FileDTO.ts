import DocumentDTO from './DocumentDTO'

interface FileDTO {
  id: number
  document: DocumentDTO
  fileName: string
  fileType: string
}

export default FileDTO
