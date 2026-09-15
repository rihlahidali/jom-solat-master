export default defineEventHandler(async (event) => {
  if (!process.env.ADMIN_SECRET) {
    setResponseStatus(event, 500);
    return { error: "Server misconfigured: ADMIN_SECRET is not set" };
  }

  const secret = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (secret !== process.env.ADMIN_SECRET) {
    setResponseStatus(event, 401);
    return { error: "Unauthorized" };
  }

  const timetable = await getTimetable();
  return timetable;
});
