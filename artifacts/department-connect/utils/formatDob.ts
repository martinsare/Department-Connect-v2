const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export function formatDob(dob: string | undefined, hideYear: boolean): string {
  if (!dob) return "—";
  const parts = dob.split("-");
  if (parts.length < 2) return dob;
  const month = MONTHS[parseInt(parts[1], 10) - 1] ?? parts[1];
  const day = parseInt(parts[2] ?? "0", 10);
  if (hideYear || parts.length < 3) return `${month} ${day}`;
  return `${month} ${day}, ${parts[0]}`;
}
