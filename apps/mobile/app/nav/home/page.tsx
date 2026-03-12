"use client";

import { Button, Modal, Image, CapsuleTabs } from "antd-mobile";
import request from "@/common/request";
import { useState } from "react";
import { RightOutline } from "antd-mobile-icons";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // 在 Home 组件内
const [toasts, setToasts] = useState<{id: number, text: string}[]>([]);

const addToast = (text: string) => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, text }]);
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 2000); // 2秒后自动移除
};


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
    addToast( "计数+1");
  };

  const list = [
    {
      title: "计数",
      key: "count",
      onClick: handleCount,
      text: "计数+1",
    },
    {
      title: "选餐",
      key: "category",
      text: "选一个",
      onClick: handleRandom,
    },
  ];

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-hidden">
      <div className="fixed bottom-60 left-0 right-0 flex flex-col items-center pointer-events-none z-[1000]">
        {toasts.map(t => (
          <div key={t.id} className="bg-black/75 text-white px-4 py-2 rounded-full mb-2 animate-bounce">
            {t.text}
          </div>
        ))}
      </div>
        <CapsuleTabs>
          {list.map((item) => (
            <CapsuleTabs.Tab title={item.title} key={item.key}>
              <div className="h-full flex flex-col items-center p-4">
                <Button
                  color="primary"
                  onClick={item.onClick}
                  className="mt-10 flex-shrink-0"
                  style={{
                    "--border-radius": "999px",
                    padding: "45px 25px",
                    fontSize: "26px",
                  }}
                >
                  {item.text}
                </Button>
                {
                  item?.key === "count" && (
                    <div className="mt-20">
                      <Button color="primary"  fill="none" onClick={() => router.push('/times')}>
                        查看记录<RightOutline />
                      </Button>
                    </div>
                  )
                }
              </div>
            </CapsuleTabs.Tab>
          ))}
        </CapsuleTabs>
      </div>
    </main>
  );
}
