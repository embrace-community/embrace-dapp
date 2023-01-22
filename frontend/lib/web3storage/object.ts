export function removeProperty(obj, propertyName) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object") {
      removeProperty(value, propertyName);
    } else if (key === propertyName) {
      delete obj[key];
    }
  }

  return obj;
}
