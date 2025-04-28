"use client";

import { useState } from "react";
import { Button, Form, Input, Toast, Space } from "antd-mobile";
import request from "@/common/request";
import { useRouter } from "next/navigation";

export default function Login() {
  const [form] = Form.useForm();

  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    const res = await form.validateFields();

    const data = await request.anon.authLogin({ ...res });
    localStorage.setItem("token", data);
    Toast.show({
      content: "登录成功",
      icon: "success",
      afterClose: () => {
        router.replace("/nav/home");
      },
    });
  };

  const handleRegister = async () => {
    const res = await form.validateFields();
    await request.anon.authRegister({ ...res });
    Toast.show({
      content: "注册成功, 请登录",
      icon: "success",
    });
    setIsRegister(false);
  };

  return (
    <div className="flex flex-col  items-center h-full text-black pt-40 px-6">
      <div className="text-2xl font-bold">登录</div>
      <Form form={form} layout="horizontal" className=" py-4 px-0 w-full">
        <Form.Item name="name" label="用户名" rules={[{ required: true }]}>
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="pwd"
          label="密码"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input placeholder="请输入密码" type="password" />
        </Form.Item>
      </Form>
      {isRegister ? (
        <div className="w-full mt-8 flex justify-between">
          <Button
            onClick={() => setIsRegister(false)}
            size="large"
            className="w-1/5"
          >
            返回
          </Button>
          <Button
            color="primary"
            size="large"
            className="w-4/5"
            style={{ marginLeft: "10px" }}
            onClick={handleRegister}
          >
            注册
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 w-full">
            <Button color="primary" block size="large" onClick={handleSubmit}>
              登录
            </Button>
          </div>

          <div className="mt-8 w-full">
            <Button
              color="primary"
              block
              size="large"
              fill="none"
              onClick={() => setIsRegister(true)}
            >
              注册
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
