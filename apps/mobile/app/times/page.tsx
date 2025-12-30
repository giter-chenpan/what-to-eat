"use client";

import dayjs from "dayjs";
import { Button, Dialog, InfiniteScroll, List, SwipeAction } from "antd-mobile";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";
import Request from "@/common/request";
import { useMemo, useState } from "react";

const PIGE_SIZE = 10;
export default function Words() {
  const [time, setTime] = useState(dayjs().format("YYYY-MM-DD"));

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

  const arrs = useMemo(
    () => data?.pages?.map((v) => v?.list)?.flat() ?? [],
    [data],
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      Dialog.confirm({
        title: "确认删除",
        content: "确认删除该条记录吗？",
        onConfirm: async () => {
          await Request.api.apiTimesDeleteTimes({ id });
          refetch();
        },
      });
    },
  });

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
      <List>
        {arrs.map((v, i) => (
          <SwipeAction
            key={i}
            rightActions={[
              {
                key: "delete",
                text: "删除",
                color: "danger",
                onClick: () => deleteMutation.mutate(v?.id || 0),
              },
            ]}
          >
            <List.Item>{v?.allTime}</List.Item>
          </SwipeAction>
        ))}
      </List>

      <InfiniteScroll loadMore={() => loadMore()} hasMore={hasNextPage} />
    </div>
  );
}
