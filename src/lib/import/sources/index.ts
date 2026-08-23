import type { SourceAdapter } from "./types";
import { ortSource } from "./ort";
import { tauSource } from "./tau";

export const SOURCE_ADAPTERS: SourceAdapter[] = [ortSource, tauSource];

export type { RawListing, SourceAdapter } from "./types";
