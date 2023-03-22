import * as soap from 'soap'
import axios from 'axios'

const clientRequest = axios.create()

export const createSoapClient = async (url: string): Promise<soap.Client> => {
  const client = await soap.createClientAsync(url, {
    request: clientRequest
  })
  return client
}

export const callFunctionSoap = async (
  client: soap.Client,
  service: string,
  port: string,
  functionName: string,
  args: any
): Promise<any> =>
  await new Promise((resolve, reject) => {
    client[service][port][functionName](args, (err: Error, result: any) => {
      if (err !== null) {
        reject(err)
      }
      resolve(result)
    })
  })
