export function getStringProp (record: Record<string, unknown>, key: string): string {
  const value = record[key]
  if (typeof value !== 'string') {
    throw new Error(`Expected string property ${key}`)
  }
  return value
}
