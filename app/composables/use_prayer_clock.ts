import { type Ref, ref, watch, onUnmounted } from "vue";
import { getPrayerClock } from "#domain/prayer/current_prayer";
import type { PrayerClock, TimedPrayer } from "#domain/prayer/prayer";

export function usePrayerClock(prayers: Ref<TimedPrayer[]>) {
  const now = ref(new Date());
  const clock = ref<PrayerClock>(getPrayerClock(prayers.value, now.value));

  let timer: ReturnType<typeof setInterval> | null = null;

  function tick() {
    now.value = new Date();
    if (prayers.value.length > 0) {
      clock.value = getPrayerClock(prayers.value, now.value);
    }
  }

  function startTimer() {
    stopTimer();
    tick();
    timer = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  watch(
    prayers,
    (newPrayers) => {
      if (newPrayers.length === 0) {
        clock.value = {
          currentPrayer: "Imsak",
          currentPrayerIndex: 0,
          nextPrayer: { name: "Subuh", index: 1 },
          isIn: false,
          isWarning: false,
          countdown: "—",
        };
        stopTimer();
      } else {
        startTimer();
      }
    },
    { immediate: true }
  );

  onUnmounted(stopTimer);

  return { clock, now };
}
