"use client";

import dayjs from "dayjs";
import { Button, InfiniteScroll, FloatingBubble } from "antd-mobile";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import Request from "@/common/request";

import { useState } from "react";
import { MessageFill } from "antd-mobile-icons";
import { useRouter } from "next/navigation";
import TimesSHow from "@/components/timesShow";

const PIGE_SIZE = 20;

export default function Words() {
  const [time, setTime] = useState(dayjs().format("YYYY-MM-DD"));
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["timeslist", time],
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await Request.api.apiTimesGetTimesPage({
        page: pageParam,
        pageSize: PIGE_SIZE,
        day: time,
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if ((lastPage?.list.length ?? 0) < PIGE_SIZE) return null;
      if (lastPage?.total === lastPage?.list.length) return null;
      return (lastPage?.page ?? 0) + 1;
    },
  });

  const loadMore = async () => {
    await fetchNextPage();
  };

  return (
    <div className="p-2 relative">
      <div className="flex justify-between items-center mb-3">
        <Button
          color="primary"
          fill="outline"
          onClick={() => {
            setTime(dayjs(time).subtract(1, "day").format("YYYY-MM-DD"));
          }}
        >
          前一天
        </Button>
        <div className="text-lg font-bold">{time}</div>
        <Button
          color="primary"
          fill="outline"
          onClick={() =>
            setTime(dayjs(time).add(1, "day").format("YYYY-MM-DD"))
          }
        >
          后一天
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <TimesSHow data={data} />
      </div>
      <InfiniteScroll loadMore={() => loadMore()} hasMore={hasNextPage} />
      <FloatingBubble
        style={{
          "--initial-position-bottom": "80px",
          "--initial-position-right": "24px",
          "--edge-distance": "24px",
        }}
        onClick={() => router.push("/nav/times/list?time=" + time)}
      >
        <MessageFill fontSize={32} />
      </FloatingBubble>
      <div className="w-full fixed bottom-0 left-0 p-2 bg-white">
        <Button color="primary" block onClick={() => router.back()}>
          返回
        </Button>
      </div>
    </div>
  );
}
