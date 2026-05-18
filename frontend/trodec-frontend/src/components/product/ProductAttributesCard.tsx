"use client";

import { Tag } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function parseValue(raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // not valid JSON — treat as plain string
      }
    }
    return trimmed === "" ? null : raw;
  }
  return raw;
}

function stringifyLeaf(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  if (value !== null && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AttributeChip({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1 bg-zinc-900/60 border border-white/8 rounded-xl p-3 hover:border-white/15 transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-white leading-snug">{value}</span>
    </div>
  );
}

function TagChip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center bg-zinc-800/80 border border-white/8 text-zinc-300 text-xs font-medium rounded-full px-3 py-1">
      {label}
    </span>
  );
}

function NestedAttributesGrid({ attrs }: Readonly<{ attrs: Record<string, unknown> }>) {
  const entries = Object.entries(attrs).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {entries.map(([k, v]) => (
        <AttributeChip key={k} label={formatKey(k)} value={stringifyLeaf(v)} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface ProductAttributesCardProps {
  metadata: Record<string, unknown> | null | undefined;
  /** Override the section title */
  title?: string;
  className?: string;
}

export function ProductAttributesCard({
  metadata,
  title = "Specifications & Attributes",
  className = "",
}: Readonly<ProductAttributesCardProps>) {
  if (!metadata) return null;

  const entries = Object.entries(metadata).filter(([, v]) => {
    const parsed = parseValue(v);
    if (parsed === null) return false;
    if (Array.isArray(parsed)) return parsed.length > 0;
    if (typeof parsed === "object") return Object.keys(parsed as object).length > 0;
    return true;
  });

  if (!entries.length) return null;

  // Separate attributes (nested objects) from other entries
  const attrEntries: Array<{ key: string; obj: Record<string, unknown> }> = [];
  const tagEntries: Array<{ key: string; arr: unknown[] }> = [];
  const scalarEntries: Array<{ key: string; value: string }> = [];

  for (const [key, raw] of entries) {
    const parsed = parseValue(raw);
    if (parsed === null) continue;

    if (Array.isArray(parsed)) {
      if (parsed.length === 0) continue;
      // If items are objects, fall through to scalar with JSON representation
      if (typeof parsed[0] !== "object") {
        tagEntries.push({ key, arr: parsed });
      } else {
        scalarEntries.push({ key, value: parsed.map(stringifyLeaf).join(", ") });
      }
    } else if (typeof parsed === "object" && parsed !== null) {
      attrEntries.push({ key, obj: parsed as Record<string, unknown> });
    } else {
      scalarEntries.push({ key, value: stringifyLeaf(parsed) });
    }
  }

  const hasContent = attrEntries.length > 0 || tagEntries.length > 0 || scalarEntries.length > 0;
  if (!hasContent) return null;

  return (
    <div className={`rounded-xl bg-[#0a0a0a] border border-white/5 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <Tag className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {title}
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Nested attribute objects (e.g. attributes: { size, color }) */}
        {attrEntries.map(({ key, obj }) => (
          <div key={key} className="space-y-2">
            {attrEntries.length > 1 && (
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                {formatKey(key)}
              </p>
            )}
            <NestedAttributesGrid attrs={obj} />
          </div>
        ))}

        {/* Scalar key-value rows */}
        {scalarEntries.length > 0 && (
          <div className="space-y-2">
            {scalarEntries.map(({ key, value }) => (
              <div
                key={key}
                className="flex items-start gap-3 text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-zinc-500 capitalize min-w-[90px] shrink-0 font-medium">
                  {formatKey(key)}
                </span>
                <span className="text-zinc-200">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Array / tag entries */}
        {tagEntries.map(({ key, arr }) => (
          <div key={key} className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {formatKey(key)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {arr.map((item, i) => (
                <TagChip key={i} label={String(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
