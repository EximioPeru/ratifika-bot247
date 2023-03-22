
// Valida que el CPE contenga el tag <cbc:ID>
export const validateCorrectJsonInvoice = (jsonInvoice: any): boolean => {
  const strJSON = JSON.stringify(jsonInvoice)
  return strJSON.includes('cbc:ID')
}
