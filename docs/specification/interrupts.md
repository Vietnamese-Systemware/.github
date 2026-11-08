# Interrupts & errors

VSUART exposes TX, RX, and error interrupts. `CR` selects trigger conditions, `IE` enables sources, and `IFS` holds flags. Software clears flags by writing one to the corresponding bits.

## TX trigger selection

| `TXISEL` | FunctionalSpec condition |
| --- | --- |
| `00` | A character moves from TX FIFO to the transmit shift register |
| `01` | All characters have been transmitted and transmission is complete |
| `10` | A character moves into the shift register and TX FIFO becomes empty |
| `11` | TX buffer overflow |

**FIFO empty and transmission complete are different events.** In mode `10`, the shift register may still be sending the final frame. Mode `01` describes completion of the entire transmission.

## RX trigger selection

| `RXISEL` | FunctionalSpec condition |
| --- | --- |
| `00` or `01` (`0x`) | A character is received / buffer is nonempty |
| `10` | RX buffer reaches three-quarters capacity |
| `11` | RX buffer is full |

## Receive error status

| STA field | Bit | Meaning | Specified clear |
| --- | --- | --- | --- |
| `FRERR` | 3 | A received stop bit is low | Read STA |
| `PRERR` | 4 | Received parity does not match configuration | Read STA |
| `RBOSTA` | 6 | RX buffer overflow | Read STA; RTL clear-mask discrepancy remains |

Section 4.3 identifies framing and parity errors as sources of `ERRIFS`. The source does not clearly establish that every overflow generates an error interrupt.

## Service an interrupt

1. Read `IFS` to identify pending sources.
2. For RX or error handling, read and **save** `STA`; this clears R1C flags under the specification.
3. Transfer data through the FIFO as appropriate and check the APB response.
4. Write a W1C mask to `IFS` for the serviced sources.
5. Recheck flags if new events may have occurred during service.

| Source | IE enable | IFS flag | Clear mask |
| --- | --- | --- | --- |
| TX | `TXTE[0]` | `TXIFS[0]` | `0x00000001` |
| RX | `RXTE[8]` | `RXIFS[8]` | `0x00000100` |
| Error | `ERRIE[16]` | `ERRIFS[16]` | `0x00010000` |

!!! warning "Simultaneous set and clear"
    The specification gives APB clear priority over internal status or interrupt events. Verify simultaneous set/clear behavior explicitly. An unconditional read-modify-write on W1C flags can clear other pending sources unintentionally.

Sources: [FunctionalSpec §§3.3–3.4, PDF pp. 11–12](../downloads/VSUART_FunctionalSpec.pdf#page=11), [§§3.7–3.8, PDF p. 15](../downloads/VSUART_FunctionalSpec.pdf#page=15), and [§4.3, PDF pp. 17–18](../downloads/VSUART_FunctionalSpec.pdf#page=17).
