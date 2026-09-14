<script setup lang="ts">
import type { DistrictId } from "#domain/prayer/prayer";

const DISTRICT_LABELS: Record<DistrictId, string> = {
  brunei: "Brunei-Muara / Temburong",
  tutong: "Tutong",
  belait: "Belait",
};

defineProps<{
  district: DistrictId;
}>();

defineEmits<{
  "update:district": [district: DistrictId];
}>();
</script>

<template>
  <div class="district-bar">
    <button
      v-for="(label, key) in DISTRICT_LABELS"
      :key="key"
      :aria-pressed="district === key"
      :class="{ active: district === key }"
      @click="$emit('update:district', key as DistrictId)"
    >
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.district-bar {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.district-bar button {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--mute);
  padding: 0.5rem 0.625rem;
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
}

.district-bar button.active {
  color: var(--now);
}
</style>
