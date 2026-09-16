/**
 * Safely extracts a renderable string from any forensic header field or Gemini response object.
 *
 * Rules:
 *   - Never render objects directly inside JSX.
 *   - Convert objects to strings.
 *   - If value is { text, html, value }, render text.
 *   - Else if field.text exists -> render field.text
 *   - Else if field.value exists -> render field.value
 *   - Else if field.html exists -> render field.html (as string)
 *   - Never return an object under any circumstances.
 *
 * @param {any} field
 * @param {string} fallback
 * @returns {string}
 */
export function sanitizeHeader(field, fallback = 'Unavailable') {
  if (field === null || field === undefined) {
    return fallback;
  }

  if (typeof field === 'string') {
    const trimmed = field.trim();
    return trimmed !== '' ? trimmed : fallback;
  }

  if (typeof field === 'number' || typeof field === 'boolean') {
    return String(field);
  }

  if (typeof field === 'object') {
    // If it's an array of fields or values
    if (Array.isArray(field)) {
      if (field.length === 0) return fallback;
      const items = field
        .map((item) => sanitizeHeader(item, ''))
        .filter(Boolean);
      return items.length > 0 ? items.join(', ') : fallback;
    }

    // Rule: If value is { text, html, value }, render text
    if (field.text !== undefined && field.text !== null) {
      return sanitizeHeader(field.text, fallback);
    }

    // Rule: Else if field.value exists -> render field.value
    if (field.value !== undefined && field.value !== null) {
      return sanitizeHeader(field.value, fallback);
    }

    // Rule: Else if field.html exists -> render field.html
    if (field.html !== undefined && field.html !== null) {
      return sanitizeHeader(field.html, fallback);
    }

    // Additional common structured fields
    if (field.status !== undefined && field.status !== null) {
      return sanitizeHeader(field.status, fallback);
    }
    if (field.reason !== undefined && field.reason !== null) {
      return sanitizeHeader(field.reason, fallback);
    }
    if (field.address !== undefined && field.address !== null) {
      return sanitizeHeader(field.address, fallback);
    }
    if (field.name !== undefined && field.name !== null) {
      return sanitizeHeader(field.name, fallback);
    }
    if (field.domain !== undefined && field.domain !== null) {
      return sanitizeHeader(field.domain, fallback);
    }
    if (field.ip !== undefined && field.ip !== null) {
      return sanitizeHeader(field.ip, fallback);
    }

    // If an arbitrary object has no known text/value property,
    // serialize safely to string rather than crashing React
    try {
      const serialized = JSON.stringify(field);
      return serialized && serialized !== '{}' ? serialized : fallback;
    } catch {
      return fallback;
    }
  }

  return String(field);
}

export default sanitizeHeader;

