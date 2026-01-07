"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Dialog, InfiniteScroll, List, SwipeAction } from "antd-mobile";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";

import Request from "@/common/request";

const PIGE_SIZE = 20;
export default function TimesListPage() {
  const searchParams = useSearchParams();
  const time = searchParams.get("time") || "";

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
    <div className="h-full overflow-auto p-3">
      <List>
        {data?.pages?.[0]?.list?.map((v) => (
          <SwipeAction
            key={v?.id}
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
