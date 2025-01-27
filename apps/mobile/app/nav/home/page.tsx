"use client";

import { Button, Modal, Image } from "antd-mobile";
import request from "@/common/request";
export default function Home() {
  const handleRandom = async () => {
    const { data } = await request.api.apiDishesGetRandomDishes();
    Modal.show({
      content: (
        <div className="text-center flex flex-col items-center">
          <div className="font-bold text-xl">{data.name}</div>
          <Image
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
  return (
    <main className="p-4 h-full flex justify-center items-center flex-col">
      <Button
        color="primary"
        onClick={handleRandom}
        style={{
          "--border-radius": "999px",
          padding: "45px 25px",
          fontSize: "26px",
        }}
      >
        选一个
      </Button>
    </main>
  );
}
