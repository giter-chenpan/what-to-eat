"use client";

import { RefObject } from "react";
import {
  Form,
  Input,
  Button,
  Picker,
  DatePickerRef,
  ImageUploader,
} from "antd-mobile";
import { useQuery } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Dishes() {
  const [form] = Form.useForm();
  const { data: categories } = useQuery({
    queryKey: ["dishesCategoryList"],
    queryFn: () => Request.api.apiCategoryGetCategory(),
  });

  console.log(categories);
  return (
    <div className="h-full dishes-page px-5 py-5 relative">
      <Form form={form} style={{ "--border-bottom": "unset" }}>
        <Form.Item
          name="name"
          label="菜谱名称"
          layout="horizontal"
          childElementPosition="right"
        >
          <Input placeholder="请输入菜谱名称" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="分类"
          trigger="onConfirm"
          onClick={(_, datePickerRef: RefObject<DatePickerRef>) => {
            datePickerRef.current?.open();
          }}
        >
          <Picker
            columns={categories?.data || []}
            fieldNames={{ label: "name", value: "id" }}
          >
            {(value) => (value ? value.join() : "Please select")}
          </Picker>
        </Form.Item>

        <Form.Item name="desc" label="图片">
          <ImageUploader upload={() => {}} />
        </Form.Item>
        <Form.Item name="description" label="菜谱描述">
          <Input placeholder="请输入菜谱描述" />
        </Form.Item>
      </Form>
      <div className="mt-5 absolute w-full px-5 left-0 bottom-6">
        <Button color="primary" block>
          保存
        </Button>
      </div>
    </div>
  );
}
