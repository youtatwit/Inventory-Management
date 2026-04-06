export function debounce(fn, delay = 200) {
  let timerId = null;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}
