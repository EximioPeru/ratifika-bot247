import FileDTO from '../dto/FileDTO'
import File from '../models/File'

class FileMap {
  public static toDTO ({ id, document_id, file_name, file_type }: any): FileDTO {
    return new File(id, document_id, file_name, file_type)
  }
}

export default FileMap
