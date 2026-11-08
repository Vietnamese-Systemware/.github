# Interfaces & clocks

Signal names follow FunctionalSpec. The RTL column gives the corresponding port on `0_rtl/vsuart.v`.

## Clock and reset

| Specification | RTL port | Direction | Description |
| --- | --- | --- | --- |
| `sys_clk` | `sys_clk` | Input | System clock, 40–200 MHz |
| `rst_n` | `rst_n` | Input | Asynchronous, active-low system and CSR reset |
| `PCLK` | `pclk` | Input | Rising-edge APB clock, at most 72 MHz |
| `PRESETn` | `preset_n` | Input | Active-low reset for the APB side |

FunctionalSpec §5 requires **`Fsys > Fpclk > Fu`**. The internal prescaler generates `u_clk`; see the [baud rate calculator](baudrate.md) for formulas and clock checks.

The current testbench connects both DUT resets to `clk_rst_vif.rst_n`. This is testbench wiring; an integration must determine its own reset connections.

## APB4 slave

| Signal | RTL port | Width | Direction | Purpose |
| --- | --- | --- | --- | --- |
| `PADDR` | `i_paddr` | 16 | Input | CSR offset or FIFO data address `0xFFFF` |
| `PSEL` | `i_psel` | 1 | Input | Select this peripheral |
| `PENABLE` | `i_penable` | 1 | Input | APB ACCESS phase |
| `PWRITE` | `i_pwrite` | 1 | Input | Write when high; read when low |
| `PWDATA` | `i_pwdata` | 32 | Input | Write data |
| `PSTRB` | `i_pstrb` | 4 | Input | Valid write byte lanes |
| `PREADY` | `o_pready` | 1 | Output | Transfer completion; specification initial value 1 |
| `PRDATA` | `o_prdata` | 32 | Output | Read data; initial value 0 |
| `PSLVERR` | `o_pslverr` | 1 | Output | Access error; initial value 0 |

### CSR and FIFO accesses

Seven 32-bit CSRs occupy offsets `0x0000` through `0x0018`.

- **TX write:** `PADDR=0xFFFF`, payload in `PWDATA[8:0]`, `PSTRB=0011`.
- **RX read:** `PADDR=0xFFFF`, receive payload from `PRDATA[8:0]`.
- Data bits `[31:9]` are reserved for FIFO accesses.

!!! warning "Use the exact FIFO address"
    `0xFFFF` is a special data address defined by the project specification. Do not round it down to `0xFFFC` in a bus sequence.

### Error conditions

| Access | Specified response |
| --- | --- |
| Write `BSEL`, `PDSEL`, `SPSEL`, or `BRG` while the core is active and either TX or RX remains enabled | Ignore the write and assert `PSLVERR` |
| Write `PRS` while `UEN[2]=1` | Ignore the write and assert `PSLVERR` |
| Read an empty RX FIFO | Report a transfer error |

The specification also requires TX and RX to be idle when changing `CR` or `IE`. Invalid software accesses are not necessarily blocked in hardware.

## Serial and interrupt ports

| RTL port | Direction | Purpose |
| --- | --- | --- |
| `i_rx` | Input | Received serial data |
| `o_tx` | Output | Transmitted serial data |
| `o_txifs` | Output | TX interrupt |
| `o_rxifs` | Output | RX interrupt |
| `o_errifs` | Output | Error interrupt |

Sources: [FunctionalSpec §2, PDF pp. 7–8](../downloads/VSUART_FunctionalSpec.pdf#page=7), [§4.4, PDF pp. 18–20](../downloads/VSUART_FunctionalSpec.pdf#page=18), [§5, PDF p. 21](../downloads/VSUART_FunctionalSpec.pdf#page=21), and `0_rtl/vsuart.v`.
