export default defineEventHandler(async () => {
  const timetable = await getTimetable();
  const availableMonths = Object.keys(timetable.months)
    .map(Number)
    .filter((month) => month >= 1 && month <= 12)
    .sort((left, right) => left - right);

  return {
    ...timetable,
    availableMonths,
  };
});
