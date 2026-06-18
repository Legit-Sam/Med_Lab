export function createRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unknown error has occurred.";
}
