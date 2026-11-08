# Register map

Seven 32-bit control/status registers configure VSUART. Offsets, access policies, and reset values below follow **FunctionalSpec**. Reserved bits read as zero and must not carry application data.

!!! warning "Check reset expectations"
    The specification and RAL reset IE to zero, while RTL defines `0x00010101`. STA also differs across the specification, RTL POR macro, and RAL fields. Account for these differences when interpreting reset behavior.

## Register summary

| Offset | Register | Specified reset | Access | Purpose |
| --- | --- | --- | --- | --- |
| `0x0000` | [MODE](#mode-0x0000) | `0x00010000` | RO/RW | Enables, frame format, oversampling |
| `0x0004` | [CR](#cr-0x0004) | `0x00000000` | RO/RW | TX/RX interrupt selection |
| `0x0008` | [STA](#sta-0x0008) | `0x00000024` | RO/R1C | Status and errors |
| `0x000C` | [PRS](#prs-0x000c) | `0x00000000` | RO/RW | UART clock prescaler |
| `0x0010` | [BRG](#brg-0x0010) | `0x00000001` | RO/RW | Baud divisor |
| `0x0014` | [IE](#ie-0x0014) | `0x00000000` | RO/RW | Interrupt enables |
| `0x0018` | [IFS](#ifs-0x0018) | `0x00000000` | RO/W1C | Interrupt flags |
| `0xFFFF` | FIFO data port | — | Write TX / Read RX | Payload `[8:0]`; separate from the CSR bank |

**RW:** read/write. **RO:** read only. **R1C:** a status read clears asserted flags. **W1C:** writing one clears the selected flag; writing zero leaves it unchanged.

## MODE · 0x0000 { #mode-0x0000 }

| Bits | Field | Reset | Access | Meaning |
| --- | --- | --- | --- | --- |
| `[2:0]` | `UEN` | `000` | RW | Bit 0: TX; bit 1: RX; bit 2: core/prescaler |
| `[8]` | `BSEL` | 0 | RW | 0: 16× oversampling; 1: 4× |
| `[17:16]` | `PDSEL` | `01` | RW | `00`: 8N; `01`: 8O; `10`: 8E; `11`: 9N |
| `[24]` | `SPSEL` | 0 | RW | 0: one stop bit; 1: two stop bits |
| Other bits | Reserved | 0 | RO | — |

Write `BSEL`, `PDSEL`, and `SPSEL` only when `UEN[2]=0` **or** `UEN[1:0]=00`. A locked write is ignored and reports `PSLVERR`. When changing only enables, write byte 0 (`PSTRB=0001`) to avoid touching the frame/baud configuration bytes, as in the TestEnv `uart_enable()` helper.

## CR · 0x0004 { #cr-0x0004 }

| Bits | Field | Reset | Access |
| --- | --- | --- | --- |
| `[1:0]` | `TXISEL` | `00` | RW |
| `[9:8]` | `RXISEL` | `00` | RW |
| Other bits | Reserved | 0 | RO |

`TXISEL`: `00` FIFO to shift register; `01` all transmission complete; `10` FIFO becomes empty as a character moves to the shift register; `11` TX buffer overflow.

`RXISEL`: `0x` received character; `10` RX buffer three-quarters full; `11` RX buffer full. Change CR only with `TISTA=1` and `RISTA=1` under the specification. See [interrupts](interrupts.md).

## STA · 0x0008 { #sta-0x0008 }

| Bit | Field | Specified reset | Access | Meaning when set |
| --- | --- | --- | --- | --- |
| 0 | `TBSTA` | 0 | RO | TX buffer full |
| 1 | `TRSTA` | 0 | RO | TX shift register and buffer empty; transmission complete |
| 2 | `TISTA` | 1 | RO | TX idle |
| 3 | `FRERR` | 0 | R1C | Framing error |
| 4 | `PRERR` | 0 | R1C | Parity error |
| 5 | `RISTA` | 1 | RO | RX idle |
| 6 | `RBOSTA` | 0 | R1C | RX buffer overflow |
| 7 | `RBDSTA` | 0 | RO | RX buffer contains data |
| `[31:8]` | Reserved | 0 | RO | — |

!!! warning "A read has side effects"
    Under FunctionalSpec, reading STA clears asserted `FRERR`, `PRERR`, and `RBOSTA`. Save the returned value before handling errors. Polling or debugger reads may consume flags. The RTL clear mask currently includes only bits 3 and 4; verify RBOSTA separately.

The specification gives APB clear priority over internal status events.

## PRS · 0x000C { #prs-0x000c }

| Bits | Field | Reset | Access | Range |
| --- | --- | --- | --- | --- |
| `[3:0]` | `PRS` | 0 | RW | 0–15 |
| `[31:4]` | Reserved | 0 | RO | — |

`Fu = Fsys / (2 × (PRS + 1))`. Write only while **`UEN[2]=0`**. Otherwise, the write is ignored and `PSLVERR` is asserted.

## BRG · 0x0010 { #brg-0x0010 }

| Bits | Field | Reset | Access | Range |
| --- | --- | --- | --- | --- |
| `[15:0]` | `BRG` | 1 | RW | **1–65535** |
| `[31:16]` | Reserved | 0 | RO | — |

`Baud = Fu / (OS × (BRG + 1))`. The specification prohibits `BRG=0` because it produces invalid RX sampling behavior. Write restrictions match the frame fields in MODE. [Calculate a divisor →](baudrate.md)

## IE · 0x0014 { #ie-0x0014 }

| Bit | Field | Specified reset | Access | Purpose |
| --- | --- | --- | --- | --- |
| 0 | `TXTE` | 0 | RW | TX interrupt enable |
| 8 | `RXTE` | 0 | RW | RX interrupt enable |
| 16 | `ERRIE` | 0 | RW | Error interrupt enable |
| Other bits | Reserved | 0 | RO | — |

Change IE while TX and RX are idle. Section 4.3 also uses the names `TXIE/RXIE`; this page follows the register table names in §3.7.

## IFS · 0x0018 { #ifs-0x0018 }

| Bit | Field | Reset | Access |
| --- | --- | --- | --- |
| 0 | `TXIFS` | 0 | W1C |
| 8 | `RXIFS` | 0 | W1C |
| 16 | `ERRIFS` | 0 | W1C |
| Other bits | Reserved | 0 | RO |

Clear TX with `0x00000001`, RX with `0x00000100`, or error with `0x00010000`. Select the corresponding byte strobes. Avoid unconditional read-modify-write operations on W1C flags.

APB clear takes priority over internal interrupt events under the specification. Revision 0.04 removed `VSUART_IFC`; clear flags through IFS.

Sources: [FunctionalSpec §3, PDF pp. 9–15](../downloads/VSUART_FunctionalSpec.pdf#page=9) and [TestEnv sheet 7, B25:C31](../downloads/VSUART_TestEnv.xlsx).
