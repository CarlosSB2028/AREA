import { API_CONFIG, HTTP_METHODS, getApiUrl } from './api.config';
import { getCookies, saveCookies, getAccessToken } from './storage';
import { parseErrorMessage } from './errors';
import { getCookieHeader } from './cookieManager';

interface QueryParams {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiRequestOptions {
  method?: string;
  params?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

async function buildUrl(path: string, params?: QueryParams): Promise<string> {
  const baseUrl = await getApiUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

async function requestInterceptor(headers: Record<string, string>): Promise<Record<string, string>> {
  const modifiedHeaders = { ...headers };

  const webViewCookies = await getCookieHeader();
  if (webViewCookies && webViewCookies.trim()) {
    modifiedHeaders.Cookie = webViewCookies;
  } else {
    const accessToken = await getAccessToken();
    if (accessToken) {
      modifiedHeaders.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('No authentication found (no cookies, no token)');
    }
  }

  const storedCookies = await getCookies();
  if (storedCookies && !webViewCookies) {
    modifiedHeaders.Cookie = storedCookies;
  }

  return modifiedHeaders;
}

async function responseInterceptor(response: Response): Promise<void> {
  const setCookieHeader = response.headers.get('set-cookie');

  if (setCookieHeader) {
    const cookies = parseCookies(setCookieHeader);
    if (cookies) {
      await saveCookies(cookies);
    }
  }
}

function parseCookies(setCookieHeader: string): string {
  const cookieStrings = setCookieHeader.split(',').map(cookie => cookie.trim());

  const cookies = cookieStrings
    .map(cookie => {
      const parts = cookie.split(';');
      return parts[0].trim();
    })
    .filter(Boolean)
    .join('; ');

  return cookies;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.warn('Failed to parse JSON response', error);
    return null;
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = HTTP_METHODS.GET, params, headers, body, signal } = options;
  const url = await buildUrl(path, params);

  const hasBody = body !== undefined && body !== null;

  const interceptedHeaders = await requestInterceptor({
    ...API_CONFIG.HEADERS,
    ...(headers || {}),
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  });

  const requestInit: RequestInit = {
    method,
    signal,
    credentials: 'include',
    headers: interceptedHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, requestInit);

  await responseInterceptor(response);

  const data = await parseJson<T>(response);

  if (!response.ok) {
    const message = (data as unknown as { message?: string })?.message;
    const errorMessage = message || `Request failed with status ${response.status}`;
    throw parseErrorMessage(errorMessage);
  }

  if (data === null || data === undefined) {
    return undefined as T;
  }

  return data as T;
}

export function get<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.GET });
}

export function post<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.POST, body });
}

export function put<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.PUT, body });
}

export function patch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.PATCH, body });
}

export function del<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.DELETE });
}

export const apiClient = {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
};
