export type RawListing = {
  externalId?: string;
  title: string;
  rawText: string;
  url: string;
  postedAt?: Date;
};

export type SourceAdapter = {
  name: string;
  fetchListings(): Promise<RawListing[]>;
};
