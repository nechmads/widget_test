export enum ApiResponseType {
  Json = "JSON",
  Stream = "STREAM",
  Raw = "RAW",
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "broswersense_backend_api.nechmads.workers.dev";

export async function getAuthTokens() {
  //   const { data } = await supabase.auth.getSession();

  //   if (!data.session) {
  //     throw new Error("No session available");
  //   }

  return {
    refreshToken: "refreshToken",
    accessToken: "accessToken",
  };
}

async function handleResponse(response: Response, wantedResponseType: ApiResponseType) {
  if (response.status !== 200) {
    throw new Error("");
  }

  switch (wantedResponseType) {
    case ApiResponseType.Json: {
      const jsonResponse = await response.json();
      return jsonResponse;
    }

    case ApiResponseType.Stream: {
      return response.body?.getReader();
    }

    case ApiResponseType.Raw:
      return response;

    default:
      return await response.json();
  }
}

export async function getApi<T>(path: string, responseType = ApiResponseType.Json) {
  const authTokens = await getAuthTokens();

  const response = await fetch(API_BASE_URL + path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-refreshToken": authTokens.refreshToken,
      "x-accessToken": authTokens.accessToken,
    },
  });

  return handleResponse(response, responseType) as T;
}

export async function postApi<T>(path: string, body: object, responseType = ApiResponseType.Json) {
  const authTokens = await getAuthTokens();

  const response = await fetch(API_BASE_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-refreshToken": authTokens.refreshToken,
      "x-accessToken": authTokens.accessToken,
    },
    body: JSON.stringify({
      ...body,
    }),
  });

  return handleResponse(response, responseType) as T;
}

export async function updateApi<T>(
  path: string,
  body: object,
  responseType = ApiResponseType.Json
) {
  const authTokens = await getAuthTokens();

  const response = await fetch(API_BASE_URL + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-refreshToken": authTokens.refreshToken,
      "x-accessToken": authTokens.accessToken,
    },
    body: JSON.stringify({
      ...body,
    }),
  });

  handleResponse(response, responseType) as T;
}

export async function deleteApi<T>(
  path: string,
  body: object,
  responseType = ApiResponseType.Json
) {
  const authTokens = await getAuthTokens();

  const response = await fetch(API_BASE_URL + path, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-refreshToken": authTokens.refreshToken,
      "x-accessToken": authTokens.accessToken,
    },
    body: JSON.stringify({
      ...body,
    }),
  });

  return handleResponse(response, responseType) as T;
}
export async function uploadApi<T>(
  path: string,
  file: Blob,
  method: "PUT" | "POST" = "PUT",
  responseType = ApiResponseType.Json
) {
  const authTokens = await getAuthTokens();

  const response = await fetch(API_BASE_URL + path, {
    method: method,
    headers: {
      "Content-Type": "application/octet-stream",
      "x-refreshToken": authTokens.refreshToken,
      "x-accessToken": authTokens.accessToken,
    },
    body: file,
  });

  handleResponse(response, responseType) as T;
}

// export async function streamApi(path: string, body: object) {
//   const authTokens = await getAuthTokens();

//   const response = await fetch(API_BASE_URL + path, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-refreshToken": authTokens.refreshToken,
//       "x-accessToken": authTokens.accessToken,
//     },
//     body: JSON.stringify({
//       ...body,
//     }),
//   });
// }
