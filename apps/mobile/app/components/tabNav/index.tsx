"use client";

import { AppOutline, UserOutline } from "antd-mobile-icons";
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
      className=" border-t-1 "
      defaultActiveKey={pathname}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
}
