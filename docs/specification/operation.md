# UART operation

Configure the peripheral while it is disabled, then enable the required data paths. This sequence combines the register restrictions in FunctionalSpec §3 with the usage guidance in §4.

## Initial configuration

1. Reset the system and APB interface; verify clock and reset connections.
2. Set `MODE.UEN=000`. Use `PSTRB=0001` when changing only the enable field.
3. Select `PRS`, `BSEL`, and `BRG` using the [baud rate calculator](baudrate.md). Check `Fsys > Fpclk > Fu`.
4. Program `PRS` while the core/prescaler is disabled. Program `BRG`, `PDSEL`, `SPSEL`, and `BSEL` while UART is disabled.
5. With both TX and RX idle, select `CR.TXISEL/RXISEL` and the interrupt enables in `IE`.
6. Handle pending flags as required: reading `STA` has side effects; clear `IFS` using W1C masks.
7. Enable the required paths: `UEN=101` for TX, `110` for RX, or `111` for both.
8. Read back the configuration and check `PSLVERR` on APB responses.

!!! note "RX setup order"
    FunctionalSpec §4.4.2 lists RX enable before configuration. The sequence above follows the explicit restrictions in §3 by configuring first and enabling afterward.

## Transmit a character

| Step | Action |
| --- | --- |
| Check enables | `UEN[2]=1` and `UEN[0]=1` |
| Check space | Inspect `TBSTA` for a full buffer; remember that reading STA clears error flags |
| Write payload | `PADDR=0xFFFF`, `PWRITE=1`, `PSTRB=0011`, payload in `PWDATA[8:0]` |
| Complete APB access | Observe `PREADY` and check `PSLVERR` |
| Observe TX | The engine drains its FIFO using the selected frame format |
| Detect completion | `TRSTA` describes an empty shift register and buffer; TX interrupt mode `01` means all transmission is complete |

In 8-bit mode, payload bit 8 is not transmitted as a data bit. The TX basic test checks this with randomized 9-bit APB payloads.

## Receive a character

1. Enable the core and RX (`UEN[2]=1`, `UEN[1]=1`) with a format matching the sender.
2. Observe `RBDSTA` or the configured RX interrupt.
3. Read `PADDR=0xFFFF` with `PWRITE=0`; take the payload from `PRDATA[8:0]`.
4. Check the APB error response. Reading an empty RX FIFO is an error.
5. Read and save `STA` to handle `FRERR`, `PRERR`, and `RBOSTA`; clear the serviced `IFS` flags with W1C masks.

## Continuous transfers

FunctionalSpec illustrates back-to-back APB FIFO writes and reads. The [TX basic test](../verification/tests.md#tx-basic) checks a SETUP phase followed by ACCESS for each item, permits ACCESS wait states, and requires `PSEL` to remain asserted across the burst.

- [APB FIFO write waveform, PDF p. 19](../downloads/VSUART_FunctionalSpec.pdf#page=19)
- [APB FIFO read waveform, PDF p. 20](../downloads/VSUART_FunctionalSpec.pdf#page=20)

## Disable or reconfigure

Wait for the relevant paths to become idle, disable TX/RX and the core, and update frame and clock parameters before enabling again. Disabling a path resets its buffer; disabling TX also aborts an in-progress transmission. Plan for pending data before disabling.

Source: [FunctionalSpec §§3–4, PDF pp. 9–20](../downloads/VSUART_FunctionalSpec.pdf#page=9).
