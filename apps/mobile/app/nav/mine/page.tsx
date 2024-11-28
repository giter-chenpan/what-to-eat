"use client";

import { SmileOutline } from "antd-mobile-icons";

import { useQuery } from "@tanstack/react-query";
import Request from "@repo/request";

export default function Mine() {
  const info = useQuery({
    queryKey: ["authGetUserInfo"],
    queryFn: Request.getuserinfo.authGetUserInfo,
  });
  console.log(info);

  return (
    <div className="flex flex-col items-center  h-full pt-20">
      <SmileOutline style={{ fontSize: "100px" }} />
    </div>
  );
}
