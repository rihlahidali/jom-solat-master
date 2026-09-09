<script setup lang="ts">
import type { PrayerDay } from "#domain/prayer/prayer";
import type { TimetableYear } from "#shared/types/timetable";

type PrayersResponse = TimetableYear & { availableMonths: number[] };

const { data, error } = await useFetch<PrayersResponse>("/api/prayers");

const previewDays = computed(() => {
  const months = data.value?.months ?? {};
  const firstMonth = data.value?.availableMonths[0];
  if (!firstMonth) {
    return [] as PrayerDay[];
  }
  return (months[String(firstMonth)] ?? []).slice(0, 3);
});

const monthLabel = computed(() => {
  const month = data.value?.availableMonths[0];
  if (!month || !data.value) {
    return "";
  }
  return new Intl.DateTimeFormat("ms-BN", {
    month: "long",
    year: "numeric",
  }).format(new Date(data.value.year, month - 1, 1));
});
</script>

<template>
  <main class="hall">
    <p class="kicker">Waktu Sembahyang Brunei</p>
    <h1>Jadual rasmi KHEU</h1>

    <p v-if="error" class="status">Tidak dapat memuat jadual.</p>
    <p v-else-if="!data || data.availableMonths.length === 0" class="status">
      Belum ada jadual. Ingest automatik datang dalam fasa 4.
    </p>
    <section v-else>
      <p class="status">
        {{ monthLabel }} · versi {{ data.version }} ·
        {{ data.availableMonths.length }} bulan disimpan
      </p>
      <ol class="days">
        <li v-for="day in previewDays" :key="day.gregorian">
          <p class="date">{{ day.gregorian }} · {{ day.hijri }}</p>
          <p class="times">
            Imsak {{ day.imsak }} · Subuh {{ day.subuh }} · Maghrib
            {{ day.maghrib }} · Isya {{ day.isya }}
          </p>
        </li>
      </ol>
    </section>

    <p class="source">
      Sumber:
      <a href="https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx">
        Kementerian Hal Ehwal Ugama
      </a>
    </p>
  </main>
</template>

<style scoped>
.hall {
  max-width: 40rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

.kicker,
.status,
.source,
.times {
  color: var(--mute);
}

.kicker {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

h1 {
  font-family: Fraunces, serif;
  font-weight: 500;
  font-size: clamp(2rem, 6vw, 3.25rem);
  margin: 0.5rem 0 1.5rem;
}

.days {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  border-top: 1px solid var(--rule);
}

.days li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--rule);
}

.date {
  margin: 0 0 0.35rem;
}

.times {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.source a {
  color: var(--now);
}
</style>
