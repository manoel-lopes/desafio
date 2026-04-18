export function getJsonBody (body: Record<string, unknown> | null): Record<string, unknown> {
  if (body === null) {
    throw new Error('Expected JSON response body')
  }
  return body
}
