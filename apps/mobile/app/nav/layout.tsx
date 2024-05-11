import type { Metadata } from "next";
import TabNav from "@/components/tabNav";

export const metadata: Metadata = {
  title: "what to eat",
  description: "what to eat",
};

export default function NavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <div className=" flex-1">{children}</div>
      <TabNav />
    </div>
  );
}
