import Document from './Document'

class File {
  id: number
  document: Document
  fileName: string
  fileType: string

  constructor (id: number, document: Document, fileName: string, fileType: string) {
    this.id = id
    this.document = document
    this.fileName = fileName
    this.fileType = fileType
  }
}

export default File
