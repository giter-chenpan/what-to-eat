"use client";
import { Button, Form, Input, Toast } from "antd-mobile";
import request from "@/common/request";
import { useRouter } from "next/navigation";

export default function Login() {
  const [form] = Form.useForm();

  const router = useRouter();
  const handleSubmit = async () => {
    const res = await form.validateFields();

    const data = await request.anon.authLogin({ ...res });
    // @ts-ignore
    localStorage.setItem("token", data?.token);
    Toast.show({
      content: "登录成功",
      icon: "success",
      afterClose: () => {
        router.replace("/nav/home");
      },
    });
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
          <Input placeholder="请输入密码" />
        </Form.Item>
      </Form>
      <div className="mt-8 w-full">
        <Button color="primary" block size="large" onClick={handleSubmit}>
          登录
        </Button>
      </div>
    </div>
  );
}
