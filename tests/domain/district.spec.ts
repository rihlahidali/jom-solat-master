import { test } from "@japa/runner";
import { districtOffsetMinutes } from "../../domain/prayer/district";
import { addMinutes } from "../../domain/prayer/parse_time";

test.group("district offsets", () => {
  test("matches KHEU minutes", ({ assert }) => {
    assert.equal(districtOffsetMinutes("brunei"), 0);
    assert.equal(districtOffsetMinutes("tutong"), 1);
    assert.equal(districtOffsetMinutes("belait"), 3);
  });

  test("shifts a prayer clock by district minutes", ({ assert }) => {
    const imsak = new Date(2021, 0, 1, 4, 55, 0, 0);
    const belait = addMinutes(imsak, districtOffsetMinutes("belait"));
    assert.equal(belait.getMinutes(), 58);
    assert.equal(belait.getHours(), 4);
  });
});
