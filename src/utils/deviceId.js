/**
 * Persistent device identifier for browser/device data isolation.
 * Generated once per browser instance and persisted in localStorage forever.
 */
const DEVICE_ID_KEY = 'phishguard_device_id';

export function getDeviceId() {
  if (typeof window === 'undefined') {
    return 'server-default-device';
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'dev-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.warn('Could not access localStorage for deviceId:', err);
    return 'fallback-device-id';
  }
}

export default getDeviceId;
