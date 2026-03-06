export const calculateBackoff = (attempt: number, baseMs = 1000, maxMs = 30_000): number => {
  const delay = baseMs * 2 ** attempt
  return Math.min(delay, maxMs)
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
