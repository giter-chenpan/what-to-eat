import type { Item } from "@repo/request";
import { Tabs, List, Card, Space, Divider } from "antd-mobile";

type Props = {
  translationResult: Item[];
};

export default function TransItem({ translationResult }: Props) {
  return (
    <Tabs defaultActiveKey="0">
      {translationResult?.map(
        ({ title, word_type_enum, pronunciation, translation }, i) => (
          <Tabs.Tab
            title={`${title} - ${word_type_enum?.description || ""}`}
            key={i}
          >
            <Card>
              <div>
                {pronunciation.map((v, i) => (
                  <Space key={i} block align="center">
                    <span>{v.lang}</span>
                    <span>{v.pron}</span>
                    <span>
                      <audio src={v.source} controls className="w-52" />
                    </span>
                  </Space>
                ))}
              </div>
              <Divider />
              {translation?.map((v, i) => (
                <div key={i}>
                  <div className="text-lg font-bold my-5 text-gray-700">
                    {v.word}
                  </div>
                  {/* <Divider /> */}
                  <List>
                    {v?.examples?.map((x, i) => (
                      <List.Item
                        key={i}
                        description={x.value}
                        className="text-gray-700"
                      >
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
  );
}
