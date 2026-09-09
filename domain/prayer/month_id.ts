export function canonicalMonth(month: number): number {
  if (month >= 1 && month <= 12) {
    return month;
  }
  throw new Error(`Invalid month: ${month}`);
}

/** Old Firestore document ids: Oct–Dec were `910`/`911`/`912`. */
export function fromLegacyMonthId(id: number): number {
  if (id === 910) return 10;
  if (id === 911) return 11;
  if (id === 912) return 12;
  return canonicalMonth(id);
}

export function toLegacyMonthId(month: number): number {
  const canonical = canonicalMonth(month);
  if (canonical === 10) return 910;
  if (canonical === 11) return 911;
  if (canonical === 12) return 912;
  return canonical;
}
