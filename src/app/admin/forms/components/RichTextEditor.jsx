"use client";

import { useEffect, useRef } from "react";

const TOOLS = [
  { command: "bold", label: "B", title: "Bold", className: "font-bold" },
  { command: "italic", label: "I", title: "Italic", className: "italic" },
  { command: "underline", label: "U", title: "Underline", className: "underline" },
  { command: "insertUnorderedList", label: "• List", title: "Bullet list" },
  { command: "insertOrderedList", label: "1. List", title: "Numbered list" },
];

function isBlank(html) {
  return String(html || "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length === 0;
}

const RichTextEditor = ({ value = "", onChange, disabled = false, placeholder = "" }) => {
  const editor = useRef(null);

  /* Load a saved value, but never while the donor is typing in the field. */
  useEffect(() => {
    const el = editor.current;
    if (!el) return;
    const next = value || "";
    if (el.innerHTML !== next && document.activeElement !== el) {
      el.innerHTML = next;
    }
  }, [value]);

  function emit() {
    const el = editor.current;
    if (!el) return;
    onChange?.(isBlank(el.innerHTML) ? "" : el.innerHTML);
  }

  function run(command) {
    if (disabled) return;
    editor.current?.focus();
    document.execCommand(command, false);
    emit();
  }

  function clear() {
    if (disabled || !editor.current) return;
    editor.current.innerHTML = "";
    editor.current.focus();
    emit();
  }

  /* Pasted HTML is dropped; only the words are kept, so a pasted page cannot bring styles in. */
  function onPaste(event) {
    if (disabled) return;
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, text);
    emit();
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-solid border-[#E5E7EB] bg-white transition focus-within:border-[#111827]/30 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.command}
            type="button"
            title={tool.title}
            aria-label={tool.title}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(tool.command)}
            className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 text-[12px] font-semibold text-[#374151] transition hover:bg-white disabled:cursor-not-allowed disabled:text-[#9CA3AF] ${tool.className}`}
          >
            {tool.label}
          </button>
        ))}

        <button
          type="button"
          title="Clear"
          aria-label="Clear"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={clear}
          className="ml-auto inline-flex h-7 items-center justify-center rounded-md px-2 text-[12px] font-semibold text-[#6B7280] transition hover:bg-white disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
        >
          Clear
        </button>
      </div>

      <div
        ref={editor}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        className="hc-rich-editor min-h-[120px] w-full px-3 py-2.5 text-[13px] text-[#111827] outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
