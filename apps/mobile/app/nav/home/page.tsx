"use client";

import { Button } from "antd-mobile";
import { useMutation } from "@tanstack/react-query";
import Request from "@/common/request";

export default function Home() {
  const mutation = useMutation({
    mutationFn: () => {
      let file = document.getElementById("fileItem")?.files?.[0];
      const formData = new FormData();
      formData.append("file", file);
      return Request.post("/api/category/import", formData);
    },
  });

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

      <input type="file" id="fileItem" />
      <Button onClick={() => mutation.mutate()}>导入</Button>
    </main>
  );
}
