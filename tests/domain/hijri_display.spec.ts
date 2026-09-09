import { test } from "@japa/runner";
import { displayHijri } from "../../domain/prayer/hijri_display";
import { at } from "./helpers";

test.group("hijri display", () => {
  test("bumps the day after Maghrib before midnight", ({ assert }) => {
    const maghribIndex = 6;
    const shown = displayHijri(
      "17 Jamadilawal 1442",
      maghribIndex,
      at(2021, 1, 1, 19, 0)
    );
    assert.equal(shown, "18 Jamadilawal 1442");
  });

  test("does not bump before Maghrib", ({ assert }) => {
    const asarIndex = 5;
    const shown = displayHijri(
      "17 Jamadilawal 1442",
      asarIndex,
      at(2021, 1, 1, 19, 0)
    );
    assert.equal(shown, "17 Jamadilawal 1442");
  });

  test("does not bump before 18:00", ({ assert }) => {
    const shown = displayHijri(
      "17 Jamadilawal 1442",
      6,
      at(2021, 1, 1, 17, 30)
    );
    assert.equal(shown, "17 Jamadilawal 1442");
  });

  test("pads single-digit bumped days", ({ assert }) => {
    const shown = displayHijri("8 Sya'ban 1444", 7, at(2021, 1, 1, 20, 0));
    assert.equal(shown, "09 Sya'ban 1444");
  });
});
