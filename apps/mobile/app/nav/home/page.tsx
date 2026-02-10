"use client";

import { Button, Modal, Image, CapsuleTabs, Toast } from "antd-mobile";
import request from "@/common/request";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import TimesShow from "@/components/timesShow";
import dayjs from "dayjs";

const PAGE_SIZE = 2000;
export default function Home() {
  const queryClient = useQueryClient();
  const time = dayjs().format("YYYY-MM-DD");

  const { data } = useInfiniteQuery({
    queryKey: ["timeslist", time],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await request.api.apiTimesGetTimesPage({
        page: pageParam,
        pageSize: PAGE_SIZE,
        day: time,
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if ((lastPage?.list.length ?? 0) < PAGE_SIZE) return null;
      if (lastPage?.total === lastPage?.list.length) return null;
      return (lastPage?.page ?? 0) + 1;
    }
  });

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
    queryClient.invalidateQueries({ queryKey: ["timeslist", time] });
  };

  const list = [
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

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-hidden">
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
              {item.key === "count" && (
                <div className="w-full mt-4 flex-1 overflow-y-auto min-h-0">
                  <TimesShow data={data} />
                </div>
              )}
            </div>
          </CapsuleTabs.Tab>
        ))}
        </CapsuleTabs>
      </div>
    </main>
  );
}
