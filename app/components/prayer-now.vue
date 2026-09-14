<script setup lang="ts">
import type { DaySchedule, PrayerClock } from "#domain/prayer/prayer";
import { formatHHmm } from "#domain/prayer/parse_time";

defineProps<{
  day: DaySchedule;
  clock: PrayerClock;
}>();
</script>

<template>
  <div class="prayer-now">
    <p class="prayer-date">{{ day.gregorianLabel }} · {{ day.hijri }}</p>
    <p class="prayer-name">{{ clock.currentPrayer }}</p>
    <time class="prayer-time">
      {{
        formatHHmm(
          day.prayers[clock.currentPrayerIndex]?.time.getHours() ?? 0,
          day.prayers[clock.currentPrayerIndex]?.time.getMinutes() ?? 0
        )
      }}
    </time>
    <p class="countdown" :class="{ warning: clock.isWarning, in: clock.isIn }">
      {{
        clock.isIn
          ? `Sudah masuk waktu ${clock.currentPrayer}`
          : `${clock.countdown} lagi kn masuk waktu ${clock.nextPrayer.name}`
      }}
    </p>
  </div>
</template>

<style scoped>
.prayer-now {
  display: grid;
  gap: 0.5rem;
}

.prayer-date {
  margin: 0;
  font-size: 0.875rem;
  color: var(--mute);
}

.prayer-name {
  margin: 0;
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--mute);
}

.prayer-time {
  font-family: "Fraunces", serif;
  font-weight: 500;
  font-size: clamp(3.5rem, 18vw, 6rem);
  line-height: 1;
  color: var(--text);
}

.countdown {
  margin: 0;
  font-size: 1rem;
  color: var(--mute);
}

.countdown.warning,
.countdown.in {
  color: var(--now);
}
</style>
