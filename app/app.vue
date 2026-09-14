<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const measurementId = config.public.gaMeasurementId;

if (measurementId) {
  useHead({
    script: [
      {
        innerHTML: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `,
      },
    ],
  });
}
</script>
