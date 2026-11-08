/* VSUART FunctionalSpec §§3.5–3.6. No network requests or persisted inputs. */
(function (root) {
  "use strict";
  function calculate({sysMHz, apbMHz, prs, os, target}) {
    if (![sysMHz, apbMHz, prs, os, target].every(Number.isFinite)) {
      return {error: "Enter a valid number in every field."};
    }
    if (sysMHz < 40 || sysMHz > 200 || apbMHz <= 0 || apbMHz > 72) {
      return {error: "System clock must be 40–200 MHz; APB clock must be greater than 0 and no more than 72 MHz."};
    }
    if (!Number.isInteger(prs) || prs < 0 || prs > 15 || ![4, 16].includes(os) || target <= 0) {
      return {error: "PRS must be an integer from 0 to 15; oversampling must be 4 or 16; target baud must be greater than zero."};
    }
    const fu = sysMHz * 1e6 / (2 * (prs + 1));
    if (!(sysMHz > apbMHz && apbMHz * 1e6 > fu)) {
      return {error: "Clock ordering Fsys > Fpclk > Fu is not satisfied. Adjust PRS or the APB clock."};
    }
    const ideal = fu / os / target - 1;
    const candidates = [Math.floor(ideal), Math.ceil(ideal)].map(n => Math.min(65535, Math.max(1, n)));
    const brg = candidates.reduce((a, b) => Math.abs(fu / (os * (a + 1)) - target) <= Math.abs(fu / (os * (b + 1)) - target) ? a : b);
    const actual = fu / (os * (brg + 1));
    return {fu, brg, bsel: os === 4 ? 1 : 0, actual,
      sampling: fu / (brg + 1), errorPct: (actual - target) / target * 100,
      cycles: 2 * (prs + 1) * os * (brg + 1), limited: ideal < 1 || ideal > 65535};
  }
  // Export the same pure calculation used by the UI for deterministic validation.
  if (typeof module !== "undefined" && module.exports) module.exports = {calculate};
  if (typeof document === "undefined") return;
  function init() {
    const form = document.getElementById("baud-calculator");
    if (!form || form.dataset.ready) return;
    form.dataset.ready = "true";
    const output = document.getElementById("baud-result");
    function read(id) {
      const raw = document.getElementById(id).value.trim();
      return raw === "" ? NaN : Number(raw);
    }
    function update() {
      const result = calculate({sysMHz: read("sys-mhz"), apbMHz: read("apb-mhz"), prs: read("prs"), os: read("os"), target: read("target-baud")});
      output.replaceChildren();
      function line(label, value) {
        const row = document.createElement("div");
        row.append(document.createTextNode(label + " "));
        const strong = document.createElement("strong"); strong.textContent = value; row.append(strong); output.append(row);
      }
      const status = document.createElement("p"); status.className = "calculator-status";
      if (result.error) {
        status.dataset.valid = "false"; status.textContent = result.error; output.append(status); return;
      }
      const fmt = n => n.toLocaleString("en-US", {maximumFractionDigits: 4});
      line("UART clock:", fmt(result.fu / 1e6) + " MHz");
      line("BSEL / BRG:", result.bsel + " / " + result.brg + " (0x" + result.brg.toString(16).toUpperCase().padStart(4, "0") + ")");
      line("Actual baud:", fmt(result.actual) + " bit/s");
      line("Baud error:", (result.errorPct >= 0 ? "+" : "") + fmt(result.errorPct) + "%");
      line("RX sampling:", fmt(result.sampling) + " Hz");
      line("System clock cycles / bit:", String(result.cycles));
      status.dataset.valid = String(!result.limited);
      status.textContent = result.limited
        ? "Target is outside the baud range for this PRS and oversampling ratio. Showing the nearest valid BRG boundary; change the configuration."
        : "Divider ranges and clock ordering are valid. Check the remote device baud tolerance before using this configuration.";
      output.append(status);
    }
    form.addEventListener("input", update); form.addEventListener("change", update); update();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(typeof globalThis !== "undefined" ? globalThis : this);
