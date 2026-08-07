"use client";

import React, { useState } from "react";
import { Upload, Loader2, Check } from "lucide-react";

interface CloudinaryUploadButtonProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}

export default function CloudinaryUploadButton({
  onUploadSuccess,
  folder = "alternate-lol",
  accept = "image/*,audio/*,video/*",
  label = "Upload File"
}: CloudinaryUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setStatus("success");
      onUploadSuccess(data.url);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setStatus("error");
      alert(err.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg cursor-pointer transition-colors text-[10px] font-bold uppercase select-none">
      {uploading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
          <span>Uploading...</span>
        </>
      ) : status === "success" ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span>Done</span>
        </>
      ) : (
        <>
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>{label}</span>
        </>
      )}
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}
