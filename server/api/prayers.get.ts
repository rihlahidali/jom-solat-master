export default defineEventHandler(() => {
  const timetable = getTimetable();
  const availableMonths = Object.keys(timetable.months)
    .map(Number)
    .filter((month) => month >= 1 && month <= 12)
    .sort((left, right) => left - right);

  return {
    ...timetable,
    availableMonths,
  };
});
