export function useNotifications() {
  const permission = ref<NotificationPermission>("default");

  function requestPermission() {
    if (!("Notification" in window)) {
      return;
    }
    permission.value = Notification.permission;
    if (permission.value === "default") {
      Notification.requestPermission().then((result) => {
        permission.value = result;
      });
    }
  }

  function notify(prayer: string, time: string) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    if (document.hidden) {
      new Notification(`Waktu ${prayer}`, {
        body: `${time} — Waktu Sembahyang Brunei`,
        tag: prayer,
      });
    }
  }

  return { permission, requestPermission, notify };
}
