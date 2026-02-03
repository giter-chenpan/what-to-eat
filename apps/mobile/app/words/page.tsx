"use client";
import { Fragment } from "react";
import { Collapse, InfiniteScroll, Button } from "antd-mobile";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import Request from "@/common/request";
import TransItem from "@/components/transItem";
import { useRouter } from "next/navigation";

const PIGE_SIZE = 5;
export default function Words() {
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["wordslist"],
    placeholderData: keepPreviousData,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await Request.api.apiTranslationFindPage({
        page: pageParam,
        pageSize: PIGE_SIZE,
        translationType: "zh",
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
    <div className="py-2 relative h-full">
      <Collapse accordion>
        {data?.pages.map((group, i) => (
          <Fragment key={i}>
            {group?.list.map((x) => (
              <Collapse.Panel
                key={x.id}
                title={<span className="pl-2">{x.word}</span>}
              >
                <TransItem translationResult={x.translations} />
              </Collapse.Panel>
            ))}
          </Fragment>
        ))}
      </Collapse>
      <InfiniteScroll loadMore={() => loadMore()} hasMore={hasNextPage} />
      <div className="w-full fixed bottom-0 left-0 p-2 bg-white">
        <Button color="primary" block onClick={() => router.back()}>
          返回
        </Button>
      </div>
    </div>
  );
}
