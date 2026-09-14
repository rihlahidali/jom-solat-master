<script setup lang="ts">
import type { DaySchedule, PrayerClock } from "#domain/prayer/prayer";
import { formatHHmm } from "#domain/prayer/parse_time";

defineProps<{
  day: DaySchedule;
  clock: PrayerClock;
}>();
</script>

<template>
  <ol class="prayer-list">
    <li
      v-for="(prayer, index) in day.prayers"
      :key="prayer.name"
      :class="{
        current: index === clock.currentPrayerIndex,
        passed: index < clock.currentPrayerIndex,
      }"
    >
      <span class="prayer-label">{{ prayer.name }}</span>
      <time class="prayer-time">{{
        formatHHmm(prayer.time.getHours(), prayer.time.getMinutes())
      }}</time>
    </li>
  </ol>
</template>

<style scoped>
.prayer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.prayer-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--rule);
  font-variant-numeric: tabular-nums;
}

.prayer-list li:last-child {
  border-bottom: none;
}

.prayer-label {
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.9375rem;
}

.prayer-time {
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
}

.prayer-list li.passed {
  color: var(--mute);
}

.prayer-list li.current {
  color: var(--now);
}
</style>
