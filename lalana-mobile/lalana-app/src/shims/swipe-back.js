// Minimal shim for 'swipe-back' to avoid Vite optimizer errors.
// Exports both a default object and a named `enable` function so common import styles work.
export function enable() {
  // no-op shim; real behavior is provided by the native runtime when building for device
  return false;
}

export default {
  enable
}
