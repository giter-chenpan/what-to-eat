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
} from "antd-mobile";
import { useDebounceFn } from "ahooks";
import { useMutation } from "@tanstack/react-query";
import Request from "@/common/request";

import { SearchBarRef } from "antd-mobile/es/components/search-bar";

export default function Translation() {
  const [direction, setDirection] = useState<"en" | "zh">("zh");
  const [texts, setTexts] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const searchRef = useRef<SearchBarRef>(null);

  const { mutate: hanldeTranslation } = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await Request.api.apiTranslationGetWords({
        destination: direction,
        words: text,
      });
      setTexts(data?.map((item) => item.word) || []);
    },
  });

  const { mutate: hanldeTranslationResult, data: translationResult } =
    useMutation({
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
      hanldeTranslation(val);
    },
    { wait: 1000 }
  );

  return (
    <div className="pt-5 pb-10 px-2.5 h-full">
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
        {!!texts?.length && (
          <List className="absolute top-11 left-0 w-full px-2 overflow-y-auto max-h-96 border-1 border-gray-200 rounded-lg">
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
      </div>

      {(translationResult?.length || 0) > 0 && (
        <Tabs defaultActiveKey="0">
          {translationResult?.map(
            ({ title, word_type_enum, pronunciation, translation }, i) => (
              <Tabs.Tab
                title={`${title} - ${word_type_enum?.description}`}
                key={i}
              >
                <Card>
                  <div>
                    {pronunciation.map((v, i) => (
                      <Space key={i} block align="center">
                        <span>{v.lang}</span>
                        <span>{v.pron}</span>
                        <span>
                          <audio src={v.source} controls />
                        </span>
                      </Space>
                    ))}
                  </div>
                  <Divider />
                  {translation?.map((v, i) => (
                    <div key={i}>
                      <div className="text-lg font-bold ">{v.word}</div>
                      <Divider />
                      <List>
                        {v?.examples?.map((x, i) => (
                          <List.Item key={i} description={x.value}>
                            {x.label}
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  ))}
                </Card>
              </Tabs.Tab>
            )
          )}
        </Tabs>
      )}
    </div>
  );
}
