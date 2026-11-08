# Features & frame formats

VSUART is a configurable serial transmitter and receiver controlled through an APB4 slave interface. The design separates the APB clock domain from the UART core; a prescaler derives `u_clk` from `sys_clk`.

## At a glance

| Capability | Project specification |
| --- | --- |
| Host interface | APB4 slave with continuous read/write transactions |
| Data width | 8 or 9 bits |
| Parity | None, odd, or even for 8-bit data; none for 9-bit data |
| Stop bits | 1 or 2 |
| Buffering | TX/RX FIFOs up to 128 entries |
| Timing | Programmable prescaler and baud divisor; 4× or 16× oversampling |
| Interrupts | TX, RX, and error outputs; TX/RX triggers selected by `CR` |
| RX checks | Framing and parity error detection |

Although the overview references 16550 functionality, VSUART defines its own [register map](registers.md). Software compatibility with a standard 16550 register layout should not be assumed.

## Choose a frame format

| `PDSEL[17:16]` | Data bits | Parity | Shorthand |
| --- | --- | --- | --- |
| `00` | 8 | None | 8N |
| `01` | 8 | Odd | 8O |
| `10` | 8 | Even | 8E |
| `11` | 9 | None | 9N |

`SPSEL=0` selects one stop bit; `SPSEL=1` selects two. A frame begins with a low start bit. Data is transmitted **least significant bit first**, as implemented in `vsuart_tx_p2s_shifter.v` and checked by the TX basic test.

```text
Idle → Start → D0 → D1 → D2 → D3 → D4 → D5 → D6 → D7 → Stop → Idle/Start
  1      0     LSB                                  MSB      1
```

An 8N1 frame occupies **10 bit-times**. Eight data bits with parity and one stop bit occupy 11 bit-times, excluding any idle gap between frames. Try the [interactive frame explorer](#frame-explorer) to see the bits change.

## Frame explorer { #frame-explorer }

Select a frame format and enter a hexadecimal payload to inspect the transmitted bits. The waveform is an illustrative frame, independent of baud timing or DUT simulation.

  <div class="frame-demo">
    <div class="demo-toolbar"><span class="mono-label">UART FRAME EXPLORER</span><span class="demo-badge">INTERACTIVE</span></div>
    <div class="frame-controls"><div class="frame-presets" role="group" aria-label="Frame format"><button type="button" data-frame="8N1" aria-pressed="true">8N1</button><button type="button" data-frame="8E1" aria-pressed="false">8E1</button><button type="button" data-frame="9N2" aria-pressed="false">9N2</button></div><label for="frame-payload">DATA <span>0x</span><input id="frame-payload" value="55" maxlength="3" inputmode="text" spellcheck="false" aria-describedby="frame-input-help"></label></div>
    <p id="frame-input-help" class="frame-help">Enter a hexadecimal payload (00–FF for 8-bit, 000–1FF for 9-bit).</p>
    <div class="waveform-scroll" tabindex="0" role="region" aria-label="UART waveform; scroll horizontally to see the complete frame"><svg id="frame-waveform" viewBox="0 0 760 148" role="img" aria-label="8N1 UART waveform for hexadecimal 55"></svg></div>
    <div class="frame-legend"><span><i class="legend-start"></i>Start</span><span><i class="legend-data"></i>Data</span><span><i class="legend-parity"></i>Parity</span><span><i class="legend-stop"></i>Stop</span><strong id="frame-summary" aria-live="polite">8 data bits · No parity · 1 stop bit</strong></div>
    <p class="demo-note" id="frame-note" aria-live="polite">Illustrative frame · 10 bit-times · LSB first</p>
    <noscript><p>Enable JavaScript to explore frames. An 8N1 frame contains a low start bit, eight data bits sent LSB first, and a high stop bit: 10 bit-times in total.</p></noscript>
  </div>

## Enable and reset behavior

- `UEN[2]` enables the UART core and prescaler.
- `UEN[0]` enables TX when `UEN[2]=1`.
- `UEN[1]` enables RX when `UEN[2]=1`.
- Disabling TX aborts transmission and resets its buffer.
- Disabling RX resets its buffer.

Enable TX before writing payloads to its FIFO. Data written while TX is disabled should not be expected to survive until a later enable. Follow the [operation sequence](operation.md).

!!! note "Line break support"
    FunctionalSpec §1.1 lists break generation and detection, but does not define a detailed control register or usage sequence. A software API for break is therefore still an open documentation item.

Sources: [FunctionalSpec §1.1, PDF p. 4](../downloads/VSUART_FunctionalSpec.pdf#page=4), [§3.2, PDF pp. 9–10](../downloads/VSUART_FunctionalSpec.pdf#page=9), and [§4.1, PDF p. 16](../downloads/VSUART_FunctionalSpec.pdf#page=16).
