"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABELS = {
  VIEWED: "נצפה",
  IN_PROGRESS: "בתהליך",
  REJECTED: "נדחה",
  ACCEPTED: "התקבל",
} as const;

export function StatusSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <Select name="status" defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue>
          {(value: string) => STATUS_LABELS[value as keyof typeof STATUS_LABELS] ?? value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
