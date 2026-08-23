export function getPostingOrgName(job: {
  institution?: { name: string } | null;
  source_name: string | null;
}): string {
  return job.institution?.name ?? job.source_name ?? "";
}
