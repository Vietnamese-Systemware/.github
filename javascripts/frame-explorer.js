/* Educational UART framing; no hardware access, external requests, or storage. */
(function () {
  "use strict";
  const formats = {"8N1": {width: 8, parity: false, stops: 1}, "8E1": {width: 8, parity: true, stops: 1}, "9N2": {width: 9, parity: false, stops: 2}};
  function buildFrame(format, payload) {
    const cfg = formats[format];
    if (!cfg || !Number.isInteger(payload) || payload < 0 || payload >= 2 ** cfg.width) return null;
    const bits = [{label: "START", value: 0, kind: "start"}];
    let parity = 0;
    for (let i = 0; i < cfg.width; i++) {
      const value = (payload >> i) & 1;
      bits.push({label: "D" + i, value, kind: "data"});
      parity ^= value;
    }
    if (cfg.parity) bits.push({label: "PAR", value: parity, kind: "parity"});
    for (let i = 0; i < cfg.stops; i++) bits.push({label: "STOP" + (cfg.stops > 1 ? i + 1 : ""), value: 1, kind: "stop"});
    return {bits, width: cfg.width, parity: cfg.parity, stops: cfg.stops};
  }
  if (typeof module !== "undefined" && module.exports) module.exports = {buildFrame};
  if (typeof document === "undefined") return;
  function init() {
    const svg = document.getElementById("frame-waveform");
    if (!svg) return;
    const input = document.getElementById("frame-payload");
    const summary = document.getElementById("frame-summary");
    const note = document.getElementById("frame-note");
    let format = "8N1";
    function node(tag, attrs, text) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      if (text !== undefined) el.textContent = text;
      svg.append(el);
      return el;
    }
    function render() {
      const raw = input.value.trim();
      const frame = /^[0-9a-f]{1,3}$/i.test(raw) ? buildFrame(format, parseInt(raw, 16)) : null;
      input.setAttribute("aria-invalid", String(!frame));
      if (!frame) {
        svg.replaceChildren();
        svg.setAttribute("aria-label", "No waveform: invalid hexadecimal payload");
        summary.textContent = "Invalid payload";
        note.textContent = "Enter hexadecimal data from 0 to " + (format === "9N2" ? "1FF" : "FF") + ".";
        return;
      }
      svg.replaceChildren();
      const colors = {start: "#ee827e", data: "#f4cb55", parity: "#c4a3df", stop: "#afc6b0", idle: "#a0808d"};
      const bits = [{label: "IDLE", value: 1, kind: "idle"}, ...frame.bits, {label: "IDLE", value: 1, kind: "idle"}];
      const step = 700 / bits.length;
      const y = value => value ? 45 : 96;
      node("line", {x1: 25, x2: 735, y1: 45, y2: 45, stroke: "#ffffff0b"});
      node("line", {x1: 25, x2: 735, y1: 96, y2: 96, stroke: "#ffffff0b"});
      bits.forEach((bit, i) => {
        const x = 30 + i * step;
        const color = colors[bit.kind];
        node("rect", {x, y: 29, width: step, height: 81, fill: color, opacity: bit.kind === "idle" ? .015 : .06});
        node("line", {x1: x, x2: x, y1: 22, y2: 117, stroke: "#ffffff13", "stroke-dasharray": "3 5"});
        let path = "M " + x + " " + y(bit.value) + " H " + (x + step);
        if (i < bits.length - 1) path += " V " + y(bits[i + 1].value);
        node("path", {d: path, stroke: color, fill: "none", "stroke-width": 2.3, "stroke-linejoin": "round"});
        node("text", {x: x + step / 2, y: 16, "text-anchor": "middle", fill: color, "font-family": "monospace", "font-size": 10}, bit.label);
        node("text", {x: x + step / 2, y: 133, "text-anchor": "middle", fill: color, "font-family": "monospace", "font-size": 11}, String(bit.value));
      });
      summary.textContent = frame.width + " data bits · " + (frame.parity ? "Even" : "No") + " parity · " + frame.stops + " stop bit" + (frame.stops > 1 ? "s" : "");
      note.textContent = "Illustrative frame · " + frame.bits.length + " bit-times · LSB first · 0x" + raw.toUpperCase();
      svg.setAttribute("aria-label", format + " UART waveform, payload 0x" + raw.toUpperCase() + ", bits " + frame.bits.map(bit => bit.value).join(" ") + ", least significant bit first");
    }
    document.querySelectorAll("[data-frame]").forEach(button => {
      button.addEventListener("click", () => {
        format = button.dataset.frame;
        document.querySelectorAll("[data-frame]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
        render();
      });
    });
    input.addEventListener("input", render);
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
