"use client";

import { Button, Modal, Image, CapsuleTabs, Toast } from "antd-mobile";
import { useMemo } from "react";
import request from "@/common/request";
export default function Home() {
  const handleRandom = async () => {
    const { data } = await request.api.apiDishesGetRandomDishes();
    Modal.show({
      content: (
        <div className="text-center flex flex-col items-center">
          <div className="font-bold text-xl">{data.name}</div>
          <Image
            alt="pic"
            src={`/api/file/getimage?id=${data.view_id}`}
            width={200}
            height={200}
          />
          <div className="text-sm text-gray-500">{data.desc}</div>
        </div>
      ),
      closeOnMaskClick: true,
    });
  };

  const handleCount = async () => {
    await request.api.apiTimesSetTimes();
    Toast.show({
      content: "功德+1",
      icon: "success",
    });
  };

  const list = useMemo(() => {
    return [
      {
        title: "计数",
        key: "count",
        onClick: handleCount,
        text: "功德+1",
      },
      {
        title: "选餐",
        key: "category",
        text: "选一个",
        onClick: handleRandom,
      },
    ];
  }, []);

  return (
    <main className="p-4 h-full flex justify-start items-center flex-col">
      <CapsuleTabs>
        {list.map((item) => (
          <CapsuleTabs.Tab title={item.title} key={item.key}>
            <Button
              color="primary"
              onClick={item.onClick}
              className="mt-28"
              style={{
                "--border-radius": "999px",
                padding: "45px 25px",
                fontSize: "26px",
              }}
            >
              {item.text}
            </Button>
          </CapsuleTabs.Tab>
        ))}
      </CapsuleTabs>
    </main>
  );
}
