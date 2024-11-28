"use client";

import { Button } from "antd-mobile";

export default function Home() {
  return (
    <main className="p-4 h-full flex justify-center items-center flex-col">
      <Button
        color="primary"
        style={{
          "--border-radius": "999px",
          padding: "45px 25px",
          fontSize: "26px",
        }}
      >
        选一个
      </Button>
    </main>
  );
}
