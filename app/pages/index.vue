<script setup lang="ts">
import type { DaySchedule, PrayerDay } from "#domain/prayer/prayer";
import type { TimetableYear } from "#shared/types/timetable";
import { buildThreeDayWindow } from "#domain/prayer/day_schedule";

const { district } = useDistrict();
const activeDayIndex = ref(0);

type PrayersResponse = TimetableYear & { availableMonths: number[] };

const { data } = await useFetch<PrayersResponse>("/api/prayers");

const daysByIso = computed(() => {
  const map: Record<string, PrayerDay> = {};
  if (!data.value) return map;
  for (const month of data.value.availableMonths) {
    const days = data.value.months[String(month)] ?? [];
    for (const day of days) {
      map[day.gregorian] = day;
    }
  }
  return map;
});

const now = new Date();
const threeDays = computed<DaySchedule[]>(() => {
  if (!data.value) return [];
  try {
    return buildThreeDayWindow(daysByIso.value, now, district.value);
  } catch {
    return [];
  }
});

const activeDay = computed(() => threeDays.value[activeDayIndex.value] ?? null);

const { clock } = usePrayerClock(
  computed(() => activeDay.value?.prayers ?? [])
);

const { permission, requestPermission, notify } = useNotifications();
const previousPrayer = ref<string | null>(null);

watch(
  () => clock.value.currentPrayer,
  (current) => {
    if (
      current &&
      previousPrayer.value !== null &&
      previousPrayer.value !== current &&
      clock.value.isIn
    ) {
      const prayerTime = activeDay.value?.prayers[clock.value.currentPrayerIndex];
      if (prayerTime) {
        const hours = prayerTime.time.getHours();
        const minutes = prayerTime.time.getMinutes();
        const pad = (n: number) => `${n < 10 ? "0" : ""}${n}`;
        notify(current, `${pad(hours)}:${pad(minutes)}`);
      }
    }
    previousPrayer.value = current;
  }
);
</script>

<template>
  <main class="home">
    <template v-if="!data || threeDays.length === 0">
      <p class="empty">Belum ada jadual.</p>
    </template>
    <template v-else>
      <DayStrip v-model:activeIndex="activeDayIndex" :days="threeDays" />

      <section v-if="activeDay" class="clock-main">
        <PrayerNow :day="activeDay" :clock="clock" />
        <PrayerList :day="activeDay" :clock="clock" />
      </section>

      <div class="district-bar-anchor">
        <DistrictBar v-model:district="district" />
        <button
          v-if="permission !== 'granted'"
          class="notify-btn"
          @click="requestPermission"
        >
          {{ permission === "denied" ? "Notifikasi diblokir" : "Aktifkan notifikasi" }}
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.home {
  display: grid;
  gap: 1.5rem;
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
}

.empty {
  color: var(--mute);
  text-align: center;
  padding: 4rem 1rem;
}

.clock-main {
  display: grid;
  gap: 2rem;
}

.district-bar-anchor {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.notify-btn {
  appearance: none;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--mute);
  padding: 0.375rem 0.625rem;
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.75rem;
  cursor: pointer;
}

@media (min-width: 768px) {
  .home {
    padding: 2.5rem 1.5rem;
    padding-bottom: 2.5rem;
  }

  .clock-main {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  .district-bar-anchor {
    position: static;
    background: transparent;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
