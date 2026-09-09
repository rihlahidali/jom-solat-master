import { test } from "@japa/runner";
import { fromLegacyMonthId, toLegacyMonthId } from "../../domain/prayer/month_id";
import { weekdayName } from "../../domain/prayer/calendar";

test.group("month ids", () => {
  test("maps legacy Oct–Dec firestore ids to 10–12", ({ assert }) => {
    assert.equal(fromLegacyMonthId(910), 10);
    assert.equal(fromLegacyMonthId(911), 11);
    assert.equal(fromLegacyMonthId(912), 12);
    assert.equal(fromLegacyMonthId(1), 1);
  });

  test("writes legacy ids only for Oct–Dec", ({ assert }) => {
    assert.equal(toLegacyMonthId(10), 910);
    assert.equal(toLegacyMonthId(9), 9);
  });
});

test.group("weekdays", () => {
  test("Sunday is Ahad", ({ assert }) => {
    assert.equal(weekdayName(new Date(2021, 0, 1).getDay()), "Jumaat");
    assert.equal(weekdayName(new Date(2021, 0, 3).getDay()), "Ahad");
  });
});
