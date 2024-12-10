"use client";

import { RefObject } from "react";
import {
  Form,
  Input,
  Button,
  Picker,
  DatePickerRef,
  ImageUploader,
  Toast,
} from "antd-mobile";
import { useQuery, useMutation } from "@tanstack/react-query";
import Request from "@/common/request";
import { useRouter } from "next/navigation";

export default function Dishes() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: categories } = useQuery({
    queryKey: ["dishesCategoryList"],
    queryFn: () => Request.api.apiCategoryGetCategory(),
    select: (res) =>
      res.data.map((item: { name: any; id: any }) => ({
        label: item.name,
        value: item.id,
      })),
  });

  const uploadImg = useMutation({
    mutationFn: async (file: File) => {
      console.log(file);
      const res = await Request.api.apiFileUploadFile({ file });
      return res.data;
    },
  });

  const handleSave = useMutation({
    mutationFn: async () => {
      const res = await form.validateFields();
      const { categoryId, images, ...rest } = res;
      await Request.api.apiDishesSaveDishes({
        ...rest,
        category_id: categoryId?.[0].toString(),
        view_id: images?.[0].id.toString(),
      });
      Toast.show({ content: '添加成功!', afterClose: () => router.back() })
    },
  });

  return (
    <div className="h-full dishes-page px-5 py-5 relative">
      <Form
        form={form}
        style={{ "--border-bottom": "unset" }}
        layout="horizontal"
      >
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
          childElementPosition="right"
          label="分类"
          trigger="onConfirm"
          onClick={(_, datePickerRef: RefObject<DatePickerRef>) => {
            datePickerRef.current?.open();
          }}
        >
          <Picker columns={[categories]}>
            {(value) => (value.length ? value[0]?.label : "请选择")}
          </Picker>
        </Form.Item>

        <Form.Item name="images" label="图片">
          <ImageUploader
            upload={async (e) => await uploadImg.mutateAsync(e)}
            maxCount={1}
          />
        </Form.Item>
        <Form.Item name="desc" label="菜谱描述">
          <Input placeholder="请输入菜谱描述" />
        </Form.Item>
      </Form>
      <div className="mt-5 absolute w-full px-5 left-0 bottom-6">
        <Button color="primary" block onClick={() => handleSave.mutate()}>
          保存
        </Button>
      </div>
    </div>
  );
}
