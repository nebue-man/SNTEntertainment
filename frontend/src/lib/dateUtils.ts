const pad = (n: number) => String(n).padStart(2, '0')

/** Convert a UTC ISO string from the API to the "YYYY-MM-DDTHH:mm" format
 *  that datetime-local inputs require, expressed in the browser's local time. */
export function toDateTimeLocal(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
