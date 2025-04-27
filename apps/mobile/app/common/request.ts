import { Api } from "@repo/request";
import { Toast } from "antd-mobile";

const request = new Api({ timeout: 100000 });

// 添加请求拦截器
request.instance.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    // config.headers.Authorization =
    //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MzIwMDgzMDQsInN1YiI6IjQiLCJleHAiOjE3MzQ2MDAzMDR9.jtBmeBN0Uipq5_gywmzbam4NlJqfaOpvClKx69eRNxY";
    // console.log(config);
    config.headers.Authorization = localStorage.getItem("token");
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (![200, "success"].includes(response.data.code)) {
      Toast.show({
        content: response.data.msg || "请求失败",
        icon: "fail",
      });

      return Promise.reject(response);
    }
    return response.data;
  },
  function (error) {
    if (error.status === 401) {
      window.location.replace("/login");
      return;
    }
    Toast.show({
      content: error.response.data.msg || "请求失败",
      icon: "fail",
    });
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default request;
