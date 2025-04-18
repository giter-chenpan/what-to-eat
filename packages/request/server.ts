/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Params {
  name: string;
  pwd: string;
}

export type FileUpload = object;

export interface ImportDishes {
  name: string;
  desc: string;
  category_id: string;
  view_id: string;
}

export interface FindPage {
  /** @format int32 */
  page: number;
  /** @format int32 */
  page_size: number;
}

export type FileUpload2 = object;

export interface Translation {
  destination: string;
  words: string;
}

export namespace Anon {
  /**
   * No description
   * @tags auth
   * @name AuthLogin
   * @request POST:/anon/login
   * @response `200` `any`
   */
  export namespace AuthLogin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Params;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * No description
   * @tags auth
   * @name AuthRegister
   * @request POST:/anon/register
   * @response `200` `any`
   */
  export namespace AuthRegister {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Params;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

export namespace Api {
  /**
   * No description
   * @tags auth
   * @name AuthGetUserInfo
   * @request GET:/api/getuserinfo
   * @secure
   * @response `200` `any`
   */
  export namespace AuthGetUserInfo {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Import cuisine classification from excel
   * @tags category
   * @name ApiCategoryImportCategory
   * @summary Import cuisine classification
   * @request POST:/api/category/import
   * @secure
   * @response `200` `any`
   */
  export namespace ApiCategoryImportCategory {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FileUpload;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Returns all cuisine
   * @tags category
   * @name ApiCategoryGetCategory
   * @summary Get cuisine classification
   * @request GET:/api/category
   * @secure
   * @response `200` `any`
   */
  export namespace ApiCategoryGetCategory {
    export type RequestParams = {};
    export type RequestQuery = {
      id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Delete cuisine classification by id
   * @tags category
   * @name ApiCategoryDeleteCategory
   * @summary Delete cuisine classification
   * @request DELETE:/api/category/delete
   * @secure
   * @response `200` `any`
   */
  export namespace ApiCategoryDeleteCategory {
    export type RequestParams = {};
    export type RequestQuery = {
      id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description save dishes
   * @tags dishes
   * @name ApiDishesSaveDishes
   * @summary save dishes
   * @request POST:/api/dishes/save
   * @secure
   * @response `200` `any`
   */
  export namespace ApiDishesSaveDishes {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ImportDishes;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * No description
   * @tags dishes
   * @name ApiDishesFindPage
   * @request POST:/api/dishes/findpage
   * @secure
   * @response `200` `any`
   */
  export namespace ApiDishesFindPage {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FindPage;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * No description
   * @tags dishes
   * @name ApiDishesGetRandomDishes
   * @request GET:/api/dishes/random
   * @secure
   * @response `200` `any`
   */
  export namespace ApiDishesGetRandomDishes {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Upload image to server
   * @tags file
   * @name ApiFileUploadFile
   * @summary Upload image
   * @request POST:/api/file/uploadimage
   * @secure
   * @response `200` `any`
   */
  export namespace ApiFileUploadFile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FileUpload2;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * @description Get image by id
   * @tags file
   * @name ApiFileGetImage
   * @summary Get image
   * @request GET:/api/file/getimage
   * @response `200` `any`
   */
  export namespace ApiFileGetImage {
    export type RequestParams = {};
    export type RequestQuery = {
      id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * No description
   * @tags translation
   * @name ApiTranslationHandleTranslation
   * @request POST:/api/translation/words
   * @secure
   * @response `200` `any`
   */
  export namespace ApiTranslationHandleTranslation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Translation;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }

  /**
   * No description
   * @tags translation
   * @name ApiTranslationGetWords
   * @request POST:/api/translation/get_words
   * @secure
   * @response `200` `any`
   */
  export namespace ApiTranslationGetWords {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Translation;
    export type RequestHeaders = {};
    export type ResponseBody = any;
  }
}

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title eatbe
 * @version 0.1.0
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags index
   * @name Home
   * @request GET:/
   * @response `200` `string`
   */
  home = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  anon = {
    /**
     * No description
     *
     * @tags auth
     * @name AuthLogin
     * @request POST:/anon/login
     * @response `200` `any`
     */
    authLogin: (data: Params, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/anon/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthRegister
     * @request POST:/anon/register
     * @response `200` `any`
     */
    authRegister: (data: Params, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/anon/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  api = {
    /**
     * No description
     *
     * @tags auth
     * @name AuthGetUserInfo
     * @request GET:/api/getuserinfo
     * @secure
     * @response `200` `any`
     */
    authGetUserInfo: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/getuserinfo`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Import cuisine classification from excel
     *
     * @tags category
     * @name ApiCategoryImportCategory
     * @summary Import cuisine classification
     * @request POST:/api/category/import
     * @secure
     * @response `200` `any`
     */
    apiCategoryImportCategory: (data: FileUpload, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/category/import`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns all cuisine
     *
     * @tags category
     * @name ApiCategoryGetCategory
     * @summary Get cuisine classification
     * @request GET:/api/category
     * @secure
     * @response `200` `any`
     */
    apiCategoryGetCategory: (
      query?: {
        id?: string | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/api/category`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete cuisine classification by id
     *
     * @tags category
     * @name ApiCategoryDeleteCategory
     * @summary Delete cuisine classification
     * @request DELETE:/api/category/delete
     * @secure
     * @response `200` `any`
     */
    apiCategoryDeleteCategory: (
      query: {
        id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/api/category/delete`,
        method: "DELETE",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description save dishes
     *
     * @tags dishes
     * @name ApiDishesSaveDishes
     * @summary save dishes
     * @request POST:/api/dishes/save
     * @secure
     * @response `200` `any`
     */
    apiDishesSaveDishes: (data: ImportDishes, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/dishes/save`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dishes
     * @name ApiDishesFindPage
     * @request POST:/api/dishes/findpage
     * @secure
     * @response `200` `any`
     */
    apiDishesFindPage: (data: FindPage, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/dishes/findpage`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags dishes
     * @name ApiDishesGetRandomDishes
     * @request GET:/api/dishes/random
     * @secure
     * @response `200` `any`
     */
    apiDishesGetRandomDishes: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/dishes/random`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Upload image to server
     *
     * @tags file
     * @name ApiFileUploadFile
     * @summary Upload image
     * @request POST:/api/file/uploadimage
     * @secure
     * @response `200` `any`
     */
    apiFileUploadFile: (data: FileUpload2, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/file/uploadimage`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Get image by id
     *
     * @tags file
     * @name ApiFileGetImage
     * @summary Get image
     * @request GET:/api/file/getimage
     * @response `200` `any`
     */
    apiFileGetImage: (
      query: {
        id: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/api/file/getimage`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags translation
     * @name ApiTranslationHandleTranslation
     * @request POST:/api/translation/words
     * @secure
     * @response `200` `any`
     */
    apiTranslationHandleTranslation: (data: Translation, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/translation/words`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags translation
     * @name ApiTranslationGetWords
     * @request POST:/api/translation/get_words
     * @secure
     * @response `200` `any`
     */
    apiTranslationGetWords: (data: Translation, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/api/translation/get_words`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
