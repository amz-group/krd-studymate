const KEY = 'krd_studymate_settings';

const defaults = {
  language: 'en',        // en | ku | ar
  theme: 'system',       // light | dark | system
  documentLanguage: 'en', // en | ku | ar
  autoSave: true,
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable — ignore */
  }
}