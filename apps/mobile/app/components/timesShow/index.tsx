import { Card } from "antd-mobile";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FindPageRepItem2 } from "@repo/request";
const SEGMENT_INTERVAL = 5 * 60 * 1000; // 5分钟

const colors = ["#2196f3", "#4caf50", "#ffc107", "#9c27b0", "#e91e63"];

type ListItem = FindPageRepItem2 & Record<string, any>;

export default function Show({ data }: { data: any }) {
  const [arrs, setArrs] = useState<any>([]);

  useEffect(() => {
    const obj: Record<string, any> = {};
    const list = (data?.pages?.map((v: any) => v?.list)?.flat() ??
      []) as ListItem[];

    list.forEach((item, i) => {
      if (!item) return;
      const hour = dayjs(item?.allTime).get("hour").toString();
      const timestamp = dayjs(item?.allTime).valueOf();
      if (!!obj[hour]) {
        const len = obj[hour].length;
        if (
          len > 0 &&
          timestamp - dayjs(obj[hour].at(-1)?.allTime).valueOf() >
            SEGMENT_INTERVAL
        ) {
          obj[hour].push({ ...item, color: colors[i % colors.length] });
        } else {
          obj[hour].push({ ...item, color: obj[hour].at(-1)?.color });
        }
      } else {
        obj[hour] = [{ ...item, color: colors[i % colors.length] }];
      }
    });

    setArrs(Object.entries(obj));
  }, [data]);

  return (
    <div className="pb-20">
      {arrs.map((v: any, i: number) => (
        <div key={v[0]} className="shadow-md mb-2">
          <Card title={v[0] + "时"}>
            {v?.[1].map((x: Record<string, any>, j: number) => (
              <div key={x.id || j} className="text-base">
                <div style={{ color: x?.color }}>
                  {dayjs(x?.allTime).format("HH:mm:ss")}
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
