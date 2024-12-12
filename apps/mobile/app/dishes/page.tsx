"use client"

import { Button } from 'antd-mobile'
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Dash() {
  const router = useRouter();

  const data = useQuery({
    queryKey: ["dishesList"],
    queryFn: () => Request.api.apiDishesFindPage({}),
  })
  console.log(data)

  return <div className=' h-full' >
    <div className=' fixed bg-white p-2 w-full bottom-0'>
      <Button block color='primary' onClick={() => router.push("/dishes/add")}>新增</Button>
    </div>
  </div>
}