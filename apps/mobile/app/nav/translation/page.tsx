"use client";
import { useState, useRef } from "react";
import {
  SearchBar,
  Selector,
  List,
  Tabs,
  Card,
  Divider,
  Space,
  DotLoading,
} from "antd-mobile";
import { useDebounceFn } from "ahooks";
import { useMutation } from "@tanstack/react-query";
import TransItem from "@/components/transItem";
import Request from "@/common/request";

import { SearchBarRef } from "antd-mobile/es/components/search-bar";

export default function Translation() {
  const [direction, setDirection] = useState<"en" | "zh">("zh");
  const [texts, setTexts] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const searchRef = useRef<SearchBarRef>(null);

  const { mutate: hanldeTranslation, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await Request.api.apiTranslationGetWords({
        destination: direction,
        words: text,
      });
      setTexts(data?.map((item) => item.word) || []);
    },
  });

  const {
    mutate: hanldeTranslationResult,
    data: translationResult,
    isPending: isPendingResult,
  } = useMutation({
    mutationFn: async (text: string) => {
      const res = await Request.api.apiTranslationHandleTranslation({
        destination: direction,
        words: text,
      });
      return res?.data;
    },
  });

  const options = [
    { label: "英译汉", value: "zh" },
    { label: "汉译英", value: "en" },
  ];

  const { run: handleChange } = useDebounceFn(
    (val: string) => {
      if (val === "") {
        setTexts([]);
        return;
      }
      hanldeTranslation(val);
    },
    { wait: 700 }
  );

  return (
    <div className="pt-5 pb-10 px-2.5 h-full">
      <div className="sticky top-0 bg-white z-20">
        <div className="flex gap-3">
          <Selector
            options={options}
            value={[direction]}
            onChange={(v) => setDirection(v[0] as "en" | "zh")}
          />
        </div>
        <div className="my-5 relative">
          <div className="w-full gap-2 flex items-center">
            <SearchBar
              className="flex-1"
              style={{ "--height": "40px" }}
              placeholder="请输入要翻译的文字"
              onChange={(e) => {
                setSelectedText(e);
                handleChange(e);
              }}
              ref={searchRef}
              value={selectedText}
            />
          </div>
          {!!texts?.length && !isPending && (
            <List className="absolute top-11 left-0 w-full px-2 overflow-y-auto max-h-96 border-1 border-gray-200 rounded-lg z-10">
              {texts.map((text) => (
                <List.Item
                  key={text}
                  onClick={() => {
                    setSelectedText(text);
                    setTexts([]);
                    hanldeTranslationResult(text);
                  }}
                >
                  {text}
                </List.Item>
              ))}
            </List>
          )}

          {(isPending || isPendingResult) && (
            <div className="absolute top-11 left-0 w-full px-2 overflow-y-auto max-h-96 z-10">
              <div className="flex justify-center items-center h-full">
                <DotLoading color="primary" />
              </div>
            </div>
          )}
        </div>
      </div>
      {(translationResult?.length || 0) > 0 && (
        <TransItem translationResult={translationResult || []} />
      )}
    </div>
  );
}
