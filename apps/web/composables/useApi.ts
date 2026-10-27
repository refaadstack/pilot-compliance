import type { ApiErrorBody } from '~/types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchFailure extends Error {
  statusCode?: number;
  data?: Partial<ApiErrorBody>;
}

function toApiError(error: unknown): ApiError {
  if (!(error instanceof Error)) return new ApiError('Unexpected error');
  const failure = error as FetchFailure;
  const message = failure.data?.message;
  const text = Array.isArray(message) ? message.join('; ') : message;
  if (text) return new ApiError(text, failure.statusCode);
  if (failure.statusCode === undefined) return new ApiError('Cannot reach the API. Is it running?');
  return new ApiError(`Request failed (${failure.statusCode})`, failure.statusCode);
}

type Query = Record<string, string | undefined>;

/** Thin $fetch wrapper: baseURL from runtimeConfig, auth header, readable ApiError on failure. */
export function useApi() {
  const { public: publicConfig } = useRuntimeConfig();
  const baseURL = String(publicConfig.apiBase);
  const auth = useAuthStore();

  function headers(): Record<string, string> {
    return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
  }

  async function get<T>(path: string, query?: Query): Promise<T> {
    try {
      return await $fetch<T>(path, { baseURL, query, headers: headers() });
    } catch (error) {
      throw toApiError(error);
    }
  }

  async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    try {
      return await $fetch<T>(path, { baseURL, method: 'POST', body, headers: headers() });
    } catch (error) {
      throw toApiError(error);
    }
  }

  return { get, post };
}
