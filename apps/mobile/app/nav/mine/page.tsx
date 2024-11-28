"use client";

import { SmileOutline } from "antd-mobile-icons";

import { useQuery } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Mine() {
  const { data: info } = useQuery({
    queryKey: ["authGetUserInfo"],
    queryFn: Request.api.authGetUserInfo,
  });
  console.log(info);

  return (
    <div className="flex flex-col items-center  h-full pt-20">
      <SmileOutline style={{ fontSize: "100px" }} />
      <div>{info?.data.data.name}</div>
    </div>
  );
}
