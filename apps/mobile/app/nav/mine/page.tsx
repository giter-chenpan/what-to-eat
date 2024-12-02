"use client";

import { SmileOutline } from "antd-mobile-icons";
import { List, Button } from "antd-mobile";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Request from "@/common/request";

export default function Mine() {
  const { data: info } = useQuery({
    queryKey: ["authGetUserInfo"],
    queryFn: Request.api.authGetUserInfo,
  });
  const router = useRouter();
  return (
    <div className="flex flex-col items-center  h-full pt-20 px-5">
      <SmileOutline style={{ fontSize: "100px" }} />
      <div>{info?.data.name}</div>
      <List className="w-full mt-7">
        <List.Item onClick={() => router.push("/dishes")}>我的菜谱</List.Item>
      </List>
      <div className="w-full mt-16">
        <Button
          color="primary"
          fill="outline"
          onClick={() => {}}
          block
          className="mt-7"
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
