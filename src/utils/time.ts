export const toTimeString = (t?: number) => {
    if (!t) {
      return ["00", "00", "00"].join(":");
    }
    const hours = Math.floor(t / (1000 * 60 * 60));
    t -= (hours * (1000 * 60 * 60));
    const minutes = Math.floor(t / (1000 * 60));
    t -= (minutes * (1000 * 60));
    const seconds = Math.floor(t / 1000);
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0")
    ].join(":");
}
