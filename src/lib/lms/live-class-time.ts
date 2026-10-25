/** Convert saved timestamps to the browser's local datetime input without changing the instant. */
export function localDateTimeInput(value:string):string {
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))throw new Error("Invalid class date.");
 const pad=(n:number)=>String(n).padStart(2,"0");
 return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
/** A datetime-local value must be interpreted on the device, not the server's UTC clock. */
export function sessionStartIso(value:string):string {
 const date=new Date(value);
 if(!value||!Number.isFinite(date.getTime()))throw new Error("Choose a valid class date and time.");
 return date.toISOString();
}
