import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, date, type Settings as SettingsData } from "./api";
import { playTone, saveSoundChoices, soundChoices, tones, type SoundCategory } from "./sounds";
function keyBytes(value: string): ArrayBuffer {
  const raw = atob(
    (value + "=".repeat((4 - (value.length % 4)) % 4))
      .replace(/-/g, "+")
      .replace(/_/g, "/"),
  );
  return Uint8Array.from(raw, (c) => c.charCodeAt(0)).buffer as ArrayBuffer;
}
export default function Settings({ userId }: { userId: string }) {
  const [sounds, setSounds] = useState(() => soundChoices(userId));
  const [data, setData] = useState<SettingsData | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const label = /iPhone/i.test(navigator.userAgent) ? "iPhone" : /iPad/i.test(navigator.userAgent) ? "iPad" : /Android/i.test(navigator.userAgent) ? "Android device" : "Desktop browser";
  const load = () => api<SettingsData>("settings").then(setData);
  useEffect(() => {
    void load().catch((e) => setNotice(e.message)).finally(() => setLoading(false));
  }, []);
  const act = async (fn: () => Promise<unknown>, message: string | ((result: unknown) => string)) => {
    setBusy(true);
    setNotice("");
    try {
      const result = await fn();
      await load();
      setNotice(typeof message === "function" ? message(result) : message);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const enroll = () =>
    act(async () => {
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      )
        throw new Error(
          "Push is not supported here. On iPhone, first add this app to the Home Screen.",
        );
      if (!label.trim()) throw new Error("Enter a name for this device.");
      if (!data?.push_enabled || !data.vapid_public_key)
        throw new Error(
          "Push delivery is not enabled for this installation yet.",
        );
      // Permission follows the user's tap; never prompt on page load.
      if ((await Notification.requestPermission()) !== "granted")
        throw new Error(
          "Notifications are blocked. Change this app’s permission in your device settings.",
        );
      const registration = await navigator.serviceWorker.ready;
      const key = keyBytes(data.vapid_public_key);
      let subscription = await registration.pushManager.getSubscription();
      const current = subscription?.options.applicationServerKey;
      if (subscription && (!current || new Uint8Array(current).toString() !== new Uint8Array(key).toString())) {
        if (!await subscription.unsubscribe()) throw new Error("Unable to replace the previous device subscription.");
        subscription = null;
      }
      subscription ??= await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
      await api("devices", { label: label.trim(), subscription: subscription.toJSON() });
    }, "This device is registered. Send a test and confirm that you saw it.");
  return (
    <section className="c1-settings">
      <p className="c1-eyebrow">Personal workspace</p>
      <h1>My Settings</h1>
      <p>Manage notification sounds, preferences and registered devices for your individual account.</p>
      <p><Link to="/admin/reset-password">Change my password using an email recovery link</Link></p>
      {loading && <p role="status">Loading your device preferences…</p>}
      {!loading && !data && <p className="c1-card" role="status">Device preferences are unavailable. Use Refresh status after access is restored.</p>}
      {notice && <p role="status">{notice}</p>}
      {data && (
        <section className="c1-card" aria-labelledby="device-notifications-title">
          <h2 id="device-notifications-title">Device notifications</h2>
          <p>On iPhone, open the CRM from its Home Screen icon to enable alerts.</p>
          
          <div className="c1-actions">
            <button disabled={busy || !label.trim() || !data.push_enabled} onClick={() => void enroll()}>
              Enable Notifications
            </button>
            <button
              disabled={busy}
              onClick={() => void act(load, "Device status refreshed.")}
            >
              Refresh status
            </button>
          </div>
          {!data.push_enabled && (
            <p>
              Push is currently disabled. Register and test after delivery has
              been enabled.
            </p>
          )}
        </section>
      )}
      <fieldset className="c1-card c1-sound-settings">
        <legend>In-app notification sounds</legend>
        <p>Saved on this device for your account. Background notification sounds follow your device settings.</p>
        {Object.entries({ inquiry: "Inquiries", urgent: "Urgent callbacks", staff: "Staff updates" }).map(([key, label]) => {
          const category = key as SoundCategory;
          return <div className="c1-sound-option" key={category}>
            <label><span id={`c1-sound-${category}`}>{label}</span>
              <select aria-labelledby={`c1-sound-${category}`} value={sounds[category]} onChange={event => {
                const next = { ...sounds, [category]: event.target.value as keyof typeof tones };
                if (saveSoundChoices(userId, next)) {
                  setSounds(next);
                  setNotice("Sound preferences saved on this device.");
                  void playTone("silent", true);
                } else setNotice("This browser could not save the sound preference.");
              }}>
                {Object.entries(tones).map(([value, title]) => <option key={value} value={value}>{title}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => void playTone(sounds[category], true)}
              disabled={sounds[category] === "silent"} aria-label={`Preview ${label.toLowerCase()} sound`}>Preview</button>
          </div>;
        })}
      </fieldset>
      {data && (
        <>
          <fieldset className="c1-card c1-settings-preferences" disabled={busy}>
            <legend>Notify me about</legend>
            {(["inquiries", "handoffs", "follow_ups"] as const).map((key) => (
              <label className="c1-check" key={key}>
                <input
                  type="checkbox"
                  checked={data.preferences[key]}
                  onChange={(e) => {
                    const preferences = {
                      ...data.preferences,
                      [key]: e.target.checked,
                    };
                    void act(
                      () => api("settings", preferences),
                      "Preferences saved.",
                    );
                  }}
                />
                {
                  {
                    inquiries: "New website inquiries",
                    handoffs: "Chatbot handoffs",
                    follow_ups: "Follow ups due",
                  }[key]
                }
              </label>
            ))}
          </fieldset>
          <section className="c1-card">
            <h2>Install the private app</h2>
            <p>
              Android: open Chrome’s menu and choose Install app. iPhone: Safari
              → Share → Add to Home Screen. Desktop Chrome: menu → Cast, save
              and share → Install page as app.
            </p>
            <p>
              Sign in remains required. Notification permission and registration
              are separate for every device. Offline access to customer records
              is disabled.
            </p>
          </section>
          <h2>My Devices <span className="c1-device-count">{data.devices.length}</span></h2>
          <p>Devices are identified automatically. Remove devices you no longer use.</p>
          {!data.devices.length && <p className="c1-card">No devices registered yet. Register this device to receive supported push notifications.</p>}
          {data.devices.map((device) => (
            <article className="c1-card" key={device.id}>
              <h3>{device.label}</h3>
              <p>Registered {date(device.refreshed_at)}</p>
              <div className="c1-actions">
                <button
                  disabled={busy || !data.push_enabled}
                  onClick={() =>
                    void act(
                      () => api(`devices/${device.id}/test`, {}),
                      (result) => (result as {status?: string})?.status === "provider_acceptance_only"
                        ? "Provider accepted the test. Check this device for the alert."
                        : "Test queued. Check this device for the alert.",
                    )
                  }
                >
                  Send test to this device
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    void act(async () => {
                      await api(`devices/${device.id}`, {}, "DELETE");
                    }, "Device registration removed.")
                  }
                >
                  Remove
                </button>
              </div>
              {data.receipts
                .filter((r) => r.device_id === device.id)
                .map((r) => (
                  <p key={r.outbox_id}>
                    {r.confirmed_at ? (
                      `Receipt confirmed ${date(r.confirmed_at)}`
                    ) : r.state === "accepted" ? (
                      <>
                        Provider accepted the alert.{" "}
                        <button
                          disabled={busy}
                          onClick={() =>
                            void act(
                              () =>
                                api(`devices/${device.id}/confirm`, {
                                  outbox_id: r.outbox_id,
                                }),
                              "Visual receipt recorded.",
                            )
                          }
                        >
                          I saw this alert on {device.label}
                        </button>
                      </>
                    ) : (
                      "Delivery failed."
                    )}
                  </p>
                ))}
            </article>
          ))}
        </>
      )}
    </section>
  );
}
