/* Bubbry web-push service worker. Place in /public/sw.js of each web app. */

self.addEventListener("push", function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: "Bubbry", body: event.data ? event.data.text() : "" }; }

  const title = data.title || "Bubbry";
  const options = {
    body: data.body || data.message || "",
    icon: "/bubbry-icon-192.png",
    badge: "/bubbry-icon-96.png",
    tag: data.tag || data.order_group || undefined,
    data: { url: data.url || "/notifications" },
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (const c of list) { if ("focus" in c) { c.navigate(url); return c.focus(); } }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
