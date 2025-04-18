"use client";
import { useState } from "react";
import { SearchBar, Selector } from "antd-mobile";
import { useMutation } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Translation() {
  const [direction, setDirection] = useState<"en" | "zh">("zh");

  const { mutate: translation } = useMutation({
    mutationFn: (text: string) =>
      Request.api.apiTranslationGetWords({
        destination: direction,
        words: text,
      }),
  });

  const options = [
    { label: "英译汉", value: "zh" },
    { label: "汉译英", value: "en" },
  ];

  const handleChange = (val: string) => {
    translation(val);
  };

  return (
    <div className="pt-5 pb-10 px-2.5 h-full">
      <div className="flex gap-3">
        <Selector
          options={options}
          value={[direction]}
          onChange={(v) => setDirection(v[0] as "en" | "zh")}
        />
      </div>
      <div className="my-5">
        <SearchBar placeholder="请输入要翻译的文字" onChange={handleChange} />
      </div>
    </div>
  );
}
