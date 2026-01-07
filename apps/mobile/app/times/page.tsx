"use client";

import dayjs from "dayjs";
import {
  Button,
  Card,
  Dialog,
  InfiniteScroll,
  List,
  SwipeAction,
  FloatingBubble,
} from "antd-mobile";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";
import Request from "@/common/request";
import { FindPageRepItem2 } from "@repo/request";
import { useMemo, useState } from "react";
import { MessageFill } from "antd-mobile-icons";
import { useRouter } from "next/navigation";

const PIGE_SIZE = 20;

const SEGMENT_INTERVAL = 5 * 60 * 1000; // 5分钟

const colors = ["#2196f3", "#4caf50", "#ffc107", "#9c27b0", "#e91e63"];

type ListItem = FindPageRepItem2 & Record<string, any>;
export default function Words() {
  const [time, setTime] = useState(dayjs().format("YYYY-MM-DD"));
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
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

  const arrs = useMemo(() => {
    const obj: Record<string, any> = {};
    const list = (data?.pages?.map((v) => v?.list)?.flat() ?? []) as ListItem[];

    list.forEach((item, i) => {
      if (!item) return;
      const hour = dayjs(item?.allTime).get("hour").toString();
      const timestamp = dayjs(item?.allTime).valueOf();
      if (!!obj[hour]) {
        const len = obj[hour].length;
        if (
          len > 0 &&
          timestamp - dayjs(obj[hour].at(-1)?.allTime).valueOf() >
            SEGMENT_INTERVAL
        ) {
          obj[hour].push({ ...item, color: colors[i % colors.length] });
        } else {
          obj[hour].push({ ...item, color: obj[hour].at(-1)?.color });
        }
      } else {
        obj[hour] = [{ ...item, color: colors[i % colors.length] }];
      }
    });

    return Object.entries(obj);
  }, [data]);

  return (
    <div className="p-2">
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
        {arrs.map((v, i) => (
          <div key={i} className="shadow-md">
            <Card title={v[0] + "时"}>
              {v?.[1].map((x: Record<string, any>, i: number) => (
                <div key={i} className="text-base">
                  <div key={x?.id} style={{ color: x?.color }}>
                    {dayjs(x?.allTime).format("HH:mm:ss")}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
      <InfiniteScroll loadMore={() => loadMore()} hasMore={hasNextPage} />
      <FloatingBubble
        style={{
          "--initial-position-bottom": "24px",
          "--initial-position-right": "24px",
          "--edge-distance": "24px",
        }}
        onClick={() => router.push("/times/list?time=" + time)}
      >
        <MessageFill fontSize={32} />
      </FloatingBubble>
    </div>
  );
}
