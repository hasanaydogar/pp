import { NextResponse } from 'next/server';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param status - HTTP status code
 * @param details - Optional error details
 * @returns NextResponse with error format
 */
export function createErrorResponse(
  error: string,
  status: number,
  details?: unknown,
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = { error };
  if (details) {
    response.details = details;
  }
  return NextResponse.json(response, { status });
}

/**
 * Creates a 400 Bad Request error response
 * @param error - Error message
 * @param details - Optional validation error details
 * @returns NextResponse with 400 status
 */
export function badRequest(error: string, details?: unknown) {
  return createErrorResponse(error, 400, details);
}

/**
 * Creates a 401 Unauthorized error response
 * @param error - Error message (default: 'Unauthorized')
 * @returns NextResponse with 401 status
 */
export function unauthorized(error: string = 'Unauthorized') {
  return createErrorResponse(error, 401);
}

/**
 * Creates a 404 Not Found error response
 * @param error - Error message (default: 'Not Found')
 * @returns NextResponse with 404 status
 */
export function notFound(error: string = 'Not Found') {
  return createErrorResponse(error, 404);
}

/**
 * Creates a 500 Internal Server Error response
 * @param error - Error message (default: 'Internal server error')
 * @param details - Optional error details
 * @returns NextResponse with 500 status
 */
export function internalServerError(
  error: string = 'Internal server error',
  details?: unknown,
) {
  return createErrorResponse(error, 500, details);
}

