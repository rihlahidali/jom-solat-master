import timetable from "../data/timetable.json";
import type { TimetableYear } from "../../shared/types/timetable";

// ponytail: committed JSON is enough for local read. Ceiling: Netlify functions cannot persist this file. Upgrade trigger: first ingest write — put the same TimetableYear shape in Netlify Blobs.

export function getTimetable(): TimetableYear {
  return timetable as TimetableYear;
}
