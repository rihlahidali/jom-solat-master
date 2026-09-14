<script setup lang="ts">
import type { DaySchedule } from "#domain/prayer/prayer";

const props = defineProps<{
  days: DaySchedule[];
  activeIndex: number;
}>();

const emit = defineEmits<{
  "update:activeIndex": [index: number];
}>();

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowLeft") {
    emit("update:activeIndex", Math.max(0, props.activeIndex - 1));
  } else if (event.key === "ArrowRight") {
    emit(
      "update:activeIndex",
      Math.min(props.days.length - 1, props.activeIndex + 1)
    );
  }
}
</script>

<template>
  <div
    class="day-strip"
    @keydown="onKeydown"
    tabindex="0"
    role="tablist"
    aria-label="Pilih hari"
  >
    <button
      v-for="(day, index) in days"
      :key="index"
      role="tab"
      :aria-selected="index === activeIndex"
      :class="{ active: index === activeIndex }"
      @click="emit('update:activeIndex', index)"
    >
      {{ index === 0 ? "Hari ini" : index === 1 ? "Esok" : "Lusa" }}
    </button>
  </div>
</template>

<style scoped>
.day-strip {
  display: inline-flex;
  gap: 0.25rem;
}

.day-strip button {
  appearance: none;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--mute);
  padding: 0.375rem 0.75rem;
  font-family: "Source Sans 3", sans-serif;
  font-size: 0.875rem;
  line-height: 1.4;
  cursor: pointer;
}

.day-strip button.active {
  color: var(--text);
  border-color: var(--text);
}
</style>
