export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type ValidationIssue = { loc: (string | number)[]; msg: string }

export function toApiError(status: number, body: unknown): ApiError {
  if (status === 502) {
    return new ApiError(status, "Couldn't reach Google Places. Nothing is wrong with your data, try again in a moment.")
  }
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return new ApiError(status, detail)
  if (Array.isArray(detail)) {
    const messages = (detail as ValidationIssue[]).map((d) => {
      const field = d.loc.filter((part) => part !== 'body' && part !== 'query').join('.')
      return field ? `${field}: ${d.msg}` : d.msg
    })
    return new ApiError(status, messages.join('. '))
  }
  return new ApiError(status, `Request failed (${status}).`)
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) return "Can't reach the server. Is the backend running?"
  return 'Something went wrong.'
}
