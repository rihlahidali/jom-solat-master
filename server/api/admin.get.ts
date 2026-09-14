export default defineEventHandler(async (event) => {
  const secret = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (secret !== process.env.ADMIN_SECRET) {
    setResponseStatus(event, 401);
    return { error: "Unauthorized" };
  }

  const timetable = await getTimetable();
  return timetable;
});
