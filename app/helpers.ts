export const stringify = (data: any) => {
  return JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
        ? value.toString()
        : value,
    2)
}

export const log = (data: any) => {
  return console.log(stringify(data))
}

import { randomBytes, createHmac } from 'crypto'

export const randomPassword = (bytes=12)=> {
  return randomBytes(bytes).toString('hex')
}

export const hashPassword = (password: string, salt?: string)=> {
  const _salt = salt ? salt : randomPassword()
  const hash = createHmac('sha512', _salt)
  hash.update(password)

  return {
    salt: _salt,
    password: hash.digest('hex')
  }
}
