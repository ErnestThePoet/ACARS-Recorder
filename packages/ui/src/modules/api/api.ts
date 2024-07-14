import type { AxiosError, AxiosResponse } from "axios";
import { message } from "antd";
import apiObject from "./api.json";
import axios from "axios";

export const getApiUrl = (api: keyof typeof apiObject) => {
  return "/api" + apiObject[api];
};

// Axios wrappers
export function GET(
  api: keyof typeof apiObject,
  params: any,
): Promise<AxiosResponse<any>> {
  return axios.get(getApiUrl(api), {
    params,
  });
}

export function DELETE(
  api: keyof typeof apiObject,
  params: any,
): Promise<AxiosResponse<any>> {
  return axios.delete(getApiUrl(api), {
    params,
  });
}

export function PUT(
  api: keyof typeof apiObject,
  data: any,
): Promise<AxiosResponse<any>> {
  return axios.put(getApiUrl(api), data);
}

export function POST(
  api: keyof typeof apiObject,
  data: any,
): Promise<AxiosResponse<any>> {
  return axios.post(getApiUrl(api), data);
}

// Match server package
export enum StatusCode {
  SUCCESS = 0,
  WARNING = 100,
  ERROR = 500,
}

function getBoolean(
  value: undefined | boolean | ((data: any) => boolean),
  data?: any,
): boolean {
  if (!value) {
    return false;
  }

  if (value === true) {
    return true;
  }

  return value(data);
}

function getDataOrNull(data: any) {
  return data ?? null;
}

export const handleRequest = async (
  request: Promise<AxiosResponse<any>>,
  options?: {
    useOnAxiosError?: boolean;
    suppressMessageShow?: {
      error?: boolean | ((data: any) => boolean);
      axiosError?: boolean;
      warning?: boolean | ((data: any) => boolean);
    };
    onSuccess?: ((data: any) => void) | null;
    onError?: ((data: any, msg: string) => void) | null;
    onAxiosError?: ((data: any) => void) | null;
    onWarning?: ((data: any, msg: string) => void) | null;
    onFinish?: (() => void) | null;
  },
) => {
  try {
    const result = await request;
    switch (result.data.status) {
      case StatusCode.ERROR:
        if (
          !getBoolean(
            options?.suppressMessageShow?.error,
            getDataOrNull(result.data.data),
          )
        ) {
          message.error(result.data.message);
        }
        options?.onError?.(
          getDataOrNull(result.data.data),
          result.data.message,
        );
        break;
      case StatusCode.WARNING:
        if (
          !getBoolean(
            options?.suppressMessageShow?.warning,
            getDataOrNull(result.data.data),
          )
        ) {
          message.warning(result.data.message);
        }
        options?.onWarning?.(
          getDataOrNull(result.data.data),
          result.data.message,
        );
        break;
      case StatusCode.SUCCESS:
        options?.onSuccess?.(getDataOrNull(result.data.data));
    }
  } catch (e) {
    if (!options?.suppressMessageShow?.axiosError) {
      message.error((e as AxiosError).message);
    }

    if (options?.useOnAxiosError) {
      options?.onAxiosError?.(e);
    } else {
      options?.onError?.(e, (e as AxiosError).message);
    }
  } finally {
    options?.onFinish?.();
  }
};
