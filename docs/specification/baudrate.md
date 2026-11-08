# Clock & baud rate

The prescaler derives `u_clk` from `sys_clk`. TX uses a bit enable at the baud rate; RX samples at `OS` times that rate.

## Timing equations

```text
OS        = 16 when BSEL = 0; 4 when BSEL = 1
Fu        = Fsys / (2 × (PRS + 1))
BRG_ideal = Fu / (OS × target_baud) − 1
baud      = Fu / (OS × (BRG + 1))
Fsample   = Fu / (BRG + 1) = OS × baud
error (%) = 100 × (baud − target_baud) / target_baud
```

Allowed ranges: `PRS=0…15`, **`BRG=1…65535`**, system clock 40–200 MHz, and APB clock at most 72 MHz. The required ordering is **`Fsys > Fpclk > Fu`**. Program PRS only while `UEN[2]=0`.

## Baud rate calculator

Choose the prescaler and oversampling ratio. The calculator tests the two integers adjacent to `BRG_ideal` and selects the one with the smaller absolute baud error. Out-of-range targets are clamped to a valid divisor and clearly flagged. PRS is not selected automatically; review the error tolerance of the remote device.

<div class="baud-calculator" id="baud-calculator">
  <div class="calculator-fields">
    <label for="sys-mhz">System clock (MHz)<input id="sys-mhz" type="number" min="40" max="200" step="any" value="112" required></label>
    <label for="apb-mhz">APB clock (MHz)<input id="apb-mhz" type="number" min="0.001" max="72" step="any" value="72" required></label>
    <label for="prs">Prescaler · PRS (0–15)<input id="prs" type="number" min="0" max="15" step="1" value="1" required></label>
    <label for="os">Oversampling<select id="os"><option value="16">16× · BSEL = 0</option><option value="4" selected>4× · BSEL = 1</option></select></label>
    <label for="target-baud">Target baud rate (bit/s)<input id="target-baud" type="number" min="1" step="any" value="9600" required></label>
  </div>
  <div class="calculator-result" id="baud-result" aria-live="polite" aria-atomic="true"></div>
  <noscript>Enable JavaScript to use the interactive calculator. The equations and worked example below remain available without JavaScript.</noscript>
</div>

## Worked example from the specification

For `Fsys=40 MHz`, `PRS=4`, `BSEL=1` (4×), and a target of 9,600 bit/s:

| Quantity | Result |
| --- | --- |
| UART clock | `40 MHz / (2 × 5) = 4 MHz` |
| Selected BRG | `103` (`0x0067`) |
| Actual baud | `4,000,000 / (4 × 104) = 9,615.3846 bit/s` |
| RX sampling | `4,000,000 / 104 = 38,461.5385 Hz` |
| Baud error | `+0.1603%` |

Choose an APB clock **greater than 4 MHz and less than 40 MHz** to satisfy the ordering. The PDF does not select a PCLK value for this example.

## Reference table · Fsys = 112 MHz, PRS = 1

`Fu=28 MHz`. Values below follow Table 3-5, rounded to two decimal places.

| Target (bit/s) | BRG · 16× | Actual baud | Error | BRG · 4× | Actual baud | Error |
| --- | --- | --- | --- | --- | --- | --- |
| 2,400 | 728 | 2,400.55 | +0.02% | 2916 | 2,399.73 | −0.01% |
| 4,800 | 364 | 4,794.52 | −0.11% | 1457 | 4,801.10 | +0.02% |
| 9,600 | 181 | 9,615.38 | +0.16% | 728 | 9,602.19 | +0.02% |
| 19,200 | 90 | 19,230.77 | +0.16% | 364 | 19,178.08 | −0.11% |
| 38,400 | 45 | 38,043.48 | −0.93% | 181 | 38,461.54 | +0.16% |
| 76,800 | 22 | 76,086.96 | −0.93% | 90 | 76,923.08 | +0.16% |
| 115,200 | 14 | 116,666.67 | +1.27% | 60 | 114,754.10 | −0.39% |

The table preserves the document's divisor selections. For other configurations, the calculator may select a different divisor to minimize actual error.

## Clock enables while idle

Section 4.2.2 generates `tx_cken` only while TX is enabled and transmitting; RX sampling enables are generated during reception with RX enabled. Derive frame timing from the actual divided baud rate rather than a rounded target.

Sources: [FunctionalSpec §§3.5–3.6, PDF pp. 12–14](../downloads/VSUART_FunctionalSpec.pdf#page=12), [§4.2.2, PDF p. 17](../downloads/VSUART_FunctionalSpec.pdf#page=17), and [§5, PDF p. 21](../downloads/VSUART_FunctionalSpec.pdf#page=21).
