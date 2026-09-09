import type { DistrictId } from "./prayer";

export const DISTRICT_OFFSET_MINUTES: Record<DistrictId, number> = {
  brunei: 0,
  tutong: 1,
  belait: 3,
};

export function districtOffsetMinutes(district: DistrictId): number {
  return DISTRICT_OFFSET_MINUTES[district];
}
