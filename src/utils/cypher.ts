import crypto from 'crypto'
import { config } from '../config'

export const encodeValue = (decryptedValue: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-ctr', config.secretCipher, iv)
  const encrypted = Buffer.concat([cipher.update(decryptedValue), cipher.final()])
  return `${iv.toString('hex')}&${encrypted.toString('hex')}`
}

export const decodeValue = (encryptedValue: string): string => {
  const hash = encryptedValue.split('&')
  const decipher = crypto.createDecipheriv(
    'aes-256-ctr',
    config.secretCipher,
    Buffer.from(hash[0], 'hex')
  )
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash[1], 'hex')), decipher.final()])
  return decrypted.toString()
}
