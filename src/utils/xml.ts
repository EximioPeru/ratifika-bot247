import * as parser from 'xml-js'
import fs from 'fs'

export const parseXmlToJsonFromPath = async (
  xmlFullPath: fs.PathOrFileDescriptor,
  prefix: string
): Promise<Object | null> => {
  return await new Promise((resolve, reject) => {
    try {
      fs.readFile(
        xmlFullPath,
        (err: NodeJS.ErrnoException | null, data: Buffer) => {
          if (err != null) {
            resolve(null)
            return
          }
          const json = JSON.parse(
            parser.xml2json(data.toString('utf8'), { compact: true })
          )
          resolve(json)
        }
      )
    } catch (error) {
      console.log(prefix, 'Error al leer el xml', error)
      resolve(null)
    }
  })
}

export const parseXmlToJson = async (xmlData: string): Promise<Object | null> => {
  const json = JSON.parse(
    parser.xml2json(xmlData, { compact: true })
  )
  return json
}
