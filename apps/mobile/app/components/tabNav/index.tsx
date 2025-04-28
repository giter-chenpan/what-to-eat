"use client";

import { AppOutline, UserOutline, CalculatorOutline } from "antd-mobile-icons";
import { TabBar } from "antd-mobile";
import { useRouter, usePathname } from "next/navigation";

export default function TabNav() {
  const router = useRouter();
  const pathname = usePathname();
  const tabs = [
    {
      key: "/nav/home",
      title: "首页",
      icon: <AppOutline />,
    },
    {
      key: "/nav/translation",
      title: "翻译",
      icon: <CalculatorOutline />,
    },
    {
      key: "/nav/mine",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

  const handleChange = (e: string) => {
    router.replace(e);
  };

  return (
    <TabBar
      onChange={handleChange}
      safeArea
      className=" border-t-1 fixed bottom-0 bg-white w-full"
      defaultActiveKey={pathname}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
}
