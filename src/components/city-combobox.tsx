"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pe-8 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const popupClassName =
  "w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] rounded-lg border bg-popover text-popover-foreground shadow-md transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0";

const itemClassName =
  "cursor-default rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground";

function CityList() {
  return (
    <Combobox.Portal>
      <Combobox.Positioner className="z-50 outline-none" sideOffset={4}>
        <Combobox.Popup className={popupClassName}>
          <Combobox.Empty className="px-2 py-3 text-sm text-muted-foreground">
            לא נמצא יישוב מתאים
          </Combobox.Empty>
          <Combobox.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 outline-0 data-empty:p-0">
            {(city: string) => (
              <Combobox.Item key={city} value={city} className={itemClassName}>
                {city}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  );
}

/** בחירת יישוב יחיד עם השלמה אוטומטית; הערך נשלח לטופס דרך input חבוי בשם name. */
export function CityCombobox({
  name,
  defaultValue,
  placeholder = "התחילו להקליד שם יישוב...",
  required,
  id,
  className,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}) {
  const [value, setValue] = React.useState<string | null>(defaultValue ?? null);

  return (
    <Combobox.Root
      items={CITIES as readonly string[]}
      value={value}
      onValueChange={(v) => setValue(v)}
    >
      <div className={cn("relative", className)}>
        <Combobox.Input id={id} placeholder={placeholder} className={inputClassName} />
        <div className="absolute inset-y-0 end-0 flex items-center pe-1.5 text-muted-foreground">
          <Combobox.Clear
            className="flex size-5 items-center justify-center rounded hover:text-foreground data-[disabled]:hidden"
            aria-label="ניקוי בחירה"
          >
            <XIcon className="size-3.5" />
          </Combobox.Clear>
          <Combobox.Trigger
            className="flex size-5 items-center justify-center rounded hover:text-foreground"
            aria-label="פתיחת רשימה"
          >
            <ChevronDownIcon className="size-4" />
          </Combobox.Trigger>
        </div>
        <input
          type="text"
          name={name}
          value={value ?? ""}
          required={required}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
      </div>
      <CityList />
    </Combobox.Root>
  );
}

/** בחירת כמה יישובים (למשל אזורי עבודה מועדפים למורה) — צ'יפים + השלמה אוטומטית. */
export function CityMultiCombobox({
  name,
  defaultValues = [],
  placeholder = "התחילו להקליד שם יישוב...",
  className,
}: {
  name: string;
  defaultValues?: string[];
  placeholder?: string;
  className?: string;
}) {
  const [values, setValues] = React.useState<string[]>(defaultValues);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-sm text-accent-foreground"
            >
              {city}
              <button
                type="button"
                aria-label={`הסרת ${city}`}
                className="text-accent-foreground/70 hover:text-accent-foreground"
                onClick={() => setValues(values.filter((v) => v !== city))}
              >
                <XIcon className="size-3" />
              </button>
              <input type="hidden" name={name} value={city} />
            </span>
          ))}
        </div>
      )}
      <Combobox.Root
        items={(CITIES as readonly string[]).filter((c) => !values.includes(c))}
        value={null}
        onValueChange={(v) => {
          if (v && !values.includes(v)) setValues([...values, v]);
        }}
      >
        <div className="relative">
          <Combobox.Input placeholder={placeholder} className={inputClassName} />
          <div className="absolute inset-y-0 end-0 flex items-center pe-1.5 text-muted-foreground">
            <Combobox.Trigger
              className="flex size-5 items-center justify-center rounded hover:text-foreground"
              aria-label="פתיחת רשימה"
            >
              <ChevronDownIcon className="size-4" />
            </Combobox.Trigger>
          </div>
        </div>
        <CityList />
      </Combobox.Root>
    </div>
  );
}
