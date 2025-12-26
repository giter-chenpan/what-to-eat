"use client";
import { Fragment } from "react";
import { Collapse, InfiniteScroll, List } from "antd-mobile";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import Request from "@/common/request";

const PIGE_SIZE = 5;
export default function Words() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["timeslist"],
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await Request.api.apiTimesGetTimesPage({
        page: pageParam,
        pageSize: PIGE_SIZE,
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
    <div className="p-2">
      <List>
        {data?.pages?.[0]?.list?.map((v, i) => (
          <List.Item key={i}>{v.allTime}</List.Item>
        ))}
      </List>

      <InfiniteScroll loadMore={() => loadMore()} hasMore={hasNextPage} />
    </div>
  );
}
