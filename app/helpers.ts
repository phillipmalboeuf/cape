export const log = (data: any) => {
  return console.log(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint'
        ? value.toString()
        : value,
    2))
}