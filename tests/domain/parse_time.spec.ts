import { test } from "@japa/runner";
import {
  formatDisplay12h,
  parseKheuClock,
  parseKheuToHHmm,
} from "../../domain/prayer/parse_time";

test.group("parseKheuClock", () => {
  test("pads dotted morning times", ({ assert }) => {
    assert.deepEqual(parseKheuClock("4.55", "am"), { hours: 4, minutes: 55 });
    assert.equal(parseKheuToHHmm("4.55", "am"), "04:55");
  });

  test("keeps noon zuhur at 12", ({ assert }) => {
    assert.deepEqual(parseKheuClock("12.25", "pm"), { hours: 12, minutes: 25 });
  });

  test("adds 12 hours for afternoon times", ({ assert }) => {
    assert.equal(parseKheuToHHmm("3.47", "pm"), "15:47");
    assert.equal(parseKheuToHHmm("7.34", "pm"), "19:34");
  });

  test("accepts colon separators", ({ assert }) => {
    assert.equal(parseKheuToHHmm("5:05", "am"), "05:05");
  });

  test("formats 12h display like the current UI", ({ assert }) => {
    const asar = new Date(2021, 0, 1, 15, 47, 0, 0);
    assert.equal(formatDisplay12h(asar, "pm"), "03:47 pm");
    const imsak = new Date(2021, 0, 1, 4, 55, 0, 0);
    assert.equal(formatDisplay12h(imsak, "am"), "04:55 am");
  });
});
