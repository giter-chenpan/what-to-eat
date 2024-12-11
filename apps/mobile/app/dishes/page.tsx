"use client"

import { Button } from 'antd-mobile'
import { useRouter } from "next/navigation";

export default function Dash() {
  const router = useRouter();
  return <div className=' h-full' >
    <div className=' fixed bg-white p-2 w-full bottom-0'>
      <Button block color='primary' onClick={() => router.push("/dishes/add")}>新增</Button>
    </div>
  </div>
}