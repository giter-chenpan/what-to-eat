"use client";

import { Button, Collapse, Image } from "antd-mobile";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Dash() {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["dishesList"],
    queryFn: () => Request.api.apiDishesFindPage(),
  });
  console.log(data);

  return (
    <div className=" h-full p-3">
      <Collapse accordion>
        {data?.data?.list?.map((v: any) => (
          <Collapse.Panel key={v.id} title={v.name}>
            <Image src={`/api/file/getimage?id=${v.view_id}`} alt="" lazy />
            <div>{v.desc}</div>
            <div>
              上传时间： {dayjs(v.create_time).format("YYYY-MM-DD HH:mm:ss")}
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
      <div className=" fixed bg-white p-2 w-full bottom-0 left-0">
        <Button
          block
          color="primary"
          onClick={() => router.push("/dishes/add")}
        >
          新增
        </Button>
      </div>
    </div>
  );
}
