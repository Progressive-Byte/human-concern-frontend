"use client";

export default function FieldError({ message = "" }) {
  if (!message) return null;
  return <div className="mt-1 text-[12px] font-medium text-red-600">{message}</div>;
}

