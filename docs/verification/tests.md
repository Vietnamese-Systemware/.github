# Tests

The 23 verification scenarios below follow sheet `3.Test_Scenario` of the [VSUART Testplan](../downloads/VSUART_Testplan.xlsx).

**Status:** PASS = passed; NOT RUN = not yet executed. The project owner confirmed PASS for the three scenarios with a finished date in the test plan. The remaining 20 scenarios have not yet been executed.

**Summary:** 23 testcases — 3 PASS, 20 NOT RUN.

## Test inventory

| No. | Testcase | Description | Status |
| --- | --- | --- | --- |
| 1 | [`vsuart_reset_value_test`](#test-1) | Verify register reset values after power-on reset and after rst_n assertion during operation. | **NOT RUN** |
| 2 | [`vsuart_apb_reset_test`](#test-2) | Verify APB slave recovery after PRESETn, including PRESETn in the middle of an APB transfer. | **NOT RUN** |
| 3 | [`vsuart_csr_rw_access_test`](#test-3) | Verify register write/read-back with byte strobes, back-to-back APB transfers, RO and reserved bits. | **NOT RUN** |
| 4 | [`vsuart_pslverr_locked_write_test`](#test-4) | Verify PSLVERR when protected registers are written while UART is enabled. | **NOT RUN** |
| 5 | [`vsuart_brg_range_test`](#test-5) | Verify TX baud rate for the standard baud rates in 16x (BSEL=0) and 4x (BSEL=1) oversampling. | **NOT RUN** |
| 6 | [`vsuart_brg_boundary_test`](#test-6) | Verify baud rate generation at the BRG limits (BRG=1, BRG=65535) and with the illegal value BRG=0. | **NOT RUN** |
| 7 | [`vsuart_tx_basic_test`](#tx-basic) | Verify TX FIFO write via APB, the serial frame sequence on tx and back-to-back transmission. | **PASS** |
| 8 | [`vsuart_tx_frame_formats_test`](#test-8) | Verify transmission in all frame formats (8/9 data bits, none/even/odd parity, 1/2 stop bits). | **PASS** |
| 9 | [`vsuart_tx_fifo_status_test`](#test-9) | Verify TX FIFO status flags from empty through full and back to empty (TBSTA, TISTA, TRSTA). | **NOT RUN** |
| 10 | [`vsuart_tx_fifo_overflow_test`](#test-10) | Verify TX FIFO overflow: the extra character is dropped and TXIFS is set (TXISEL=2&#x27;b11). | **NOT RUN** |
| 11 | [`vsuart_tx_irq_test`](#test-11) | Verify TX interrupt generation for TXISEL=2&#x27;b00, 2&#x27;b10 and 2&#x27;b01. | **NOT RUN** |
| 12 | [`vsuart_tx_enable_disable_test`](#test-12) | Verify that clearing UEN[0] aborts transmission and clears TX FIFO. | **NOT RUN** |
| 13 | [`vsuart_rx_basic_test_test`](#test-13) | Verify reception on rx, RX FIFO read via APB and back-to-back reception. | **NOT RUN** |
| 14 | [`vsuart_rx_frame_formats_test`](#test-14) | Verify reception in all frame formats (8/9 data bits, none/even/odd parity, 1/2 stop bits). | **PASS** |
| 15 | [`vsuart_rx_baud_drift_test`](#test-15) | Verify reception with +-2% baud rate mismatch on rx. | **NOT RUN** |
| 16 | [`vsuart_rx_enable_disable_test`](#test-16) | Verify that rx is ignored while UEN[1]=0. | **NOT RUN** |
| 17 | [`vsuart_rx_fifo_full_overflow_test`](#test-17) | Verify RX FIFO boundaries, the full interrupt (RXISEL=2&#x27;b11) and RX FIFO overflow (RBOSTA). | **NOT RUN** |
| 18 | [`vsuart_rx_fifo_underflow_test`](#test-18) | Verify PSLVERR on reading an empty RX FIFO. | **NOT RUN** |
| 19 | [`vsuart_rx_irq_test`](#test-19) | Verify RX interrupt generation for RXISEL=2&#x27;b0x and 2&#x27;b10. | **NOT RUN** |
| 20 | [`vsuart_rx_error_detect_test`](#test-20) | Verify framing and parity error detection and read-to-clear of FRERR / PRERR. | **NOT RUN** |
| 21 | [`vsuart_irq_w1c_clear_test`](#test-21) | Verify write-1-to-clear of IFS bits and de-assertion of the interrupt pins. | **NOT RUN** |
| 22 | [`vsuart_clock_cdc_test`](#test-22) | Verify TX and RX data transfer between PCLK and sys_clk domains for every clock configuration. | **NOT RUN** |
| 23 | [`vsuart_full_duplex_test`](#test-23) | Verify simultaneous transmission and reception with independent data streams. | **NOT RUN** |

Test names are preserved exactly as written in the workbook, including `vsuart_rx_basic_test_test`.

## Scenario details

### 1. vsuart_reset_value_test { #test-1 }

**Covered items:** F1.1.3.1, F2.1.1.2  
**Method:** Waveform + Self-check TM  
**Priority:** Medium

Verify register reset values after power-on reset and after rst_n assertion during operation.

**Pass criteria:** All registers equal their reset values after Power On Reset and after rst_n during operation; output pins are in the reset state.

### 2. vsuart_apb_reset_test { #test-2 }

**Covered items:** F1.1.4.1, F1.1.4.2  
**Method:** Waveform  
**Priority:** Medium

Verify APB slave recovery after PRESETn, including PRESETn in the middle of an APB transfer.

**Pass criteria:** APB returns to IDLE after every PRESETn; the interrupted transfer is not completed; following transfers complete without error and data_read = data_write.

### 3. vsuart_csr_rw_access_test { #test-3 }

**Covered items:** F2.1.1.1, F2.1.1.3, F2.2.1.1  
**Method:** Self-check TM + Assertion  
**Priority:** High

Verify register write/read-back with byte strobes, back-to-back APB transfers, RO and reserved bits.

**Pass criteria:** data_read = data_write on RW fields (per byte strobe); RO and reserved bits are not modified; no transfer is lost in back-to-back mode; PSLVERR=0.

### 4. vsuart_pslverr_locked_write_test { #test-4 }

**Covered items:** F2.1.2.1  
**Method:** Self-check TM  
**Priority:** Medium

Verify PSLVERR when protected registers are written while UART is enabled.

**Pass criteria:** Writes to protected registers while UART is enabled give PSLVERR=1 and do not change the register; the same writes with UART disabled are accepted (data_read = data_write).

### 5. vsuart_brg_range_test { #test-5 }

**Covered items:** F2.3.1.1, F2.3.1.2  
**Method:** Self-check TM  
**Priority:** Medium

Verify TX baud rate for the standard baud rates in 16x (BSEL=0) and 4x (BSEL=1) oversampling.

**Pass criteria:** Bit period = Oversample x (BRG+1) / Fu_clk with Fu_clk = Fsys_clk / (2 x (PRS+1)); transmitted data = written data.

### 6. vsuart_brg_boundary_test { #test-6 }

**Covered items:** F2.3.2.1, F2.3.2.2, F2.3.2.3  
**Method:** Self-check TM  
**Priority:** Medium

Verify baud rate generation at the BRG limits (BRG=1, BRG=65535) and with the illegal value BRG=0.

**Pass criteria:** Bit period = Oversample x (BRG+1) / Fu_clk for BRG=1 and BRG=65535; UART_BRG safely handles the illegal value BRG=0.

### 7. vsuart_tx_basic_test { #tx-basic }

**Covered items:** F2.1.3.1, F2.4.1.1, F2.4.2.1, F2.4.2.3  
**Method:** Self-check TM  
**Priority:** High

**Finished date in test plan:** `26/10/29`; **Status: PASS** (confirmed by the project owner).

Verify TX FIFO write via APB, the serial frame sequence on tx and back-to-back transmission.

**Pass criteria:** Transmitted data = written data, in the same order; frame sequence and bit time are correct; no gap between consecutive frames; APB signals follow the protocol.

### 8. vsuart_tx_frame_formats_test { #test-8 }

**Covered items:** F2.4.2.2  
**Method:** Self-check TM  
**Priority:** High

**Finished date in test plan:** `26/10/29`; **Status: PASS** (confirmed by the project owner).

Verify transmission in all frame formats (8/9 data bits, none/even/odd parity, 1/2 stop bits).

**Pass criteria:** Data bits, parity bit and stop bits match the configured format; data bit 8 is kept in 9-bit mode; transmitted data = written data.

### 9. vsuart_tx_fifo_status_test { #test-9 }

**Covered items:** F2.4.1.2, F2.4.1.3  
**Method:** Self-check TM  
**Priority:** Medium

Verify TX FIFO status flags from empty through full and back to empty (TBSTA, TISTA, TRSTA).

**Pass criteria:** TBSTA shows FIFO full, TISTA shows TX idle, TRSTA is 1 only when TX FIFO and shift register are empty; transmitted data = written data, in the same order.

### 10. vsuart_tx_fifo_overflow_test { #test-10 }

**Covered items:** F2.4.1.4, F2.4.4.4  
**Method:** Self-check TM + Assertion  
**Priority:** Medium

Verify TX FIFO overflow: the extra character is dropped and TXIFS is set (TXISEL=2'b11).

**Pass criteria:** The 129th character is dropped; the 128 accepted characters are transmitted in order (transmitted data = written data); TXIFS is set on overflow and cleared by writing 1.

### 11. vsuart_tx_irq_test { #test-11 }

**Covered items:** F2.4.4.1, F2.4.4.2, F2.4.4.3  
**Method:** Assertion + Self-check TM  
**Priority:** Medium

Verify TX interrupt generation for TXISEL=2'b00, 2'b10 and 2'b01.

**Pass criteria:** TXIFS and ifs_tx assert at the event selected by TXISEL and de-assert after writing 1 to IFS[0].

### 12. vsuart_tx_enable_disable_test { #test-12 }

**Covered items:** F2.4.2.4  
**Method:** Self-check TM  
**Priority:** Medium

Verify that clearing UEN[0] aborts transmission and clears TX FIFO.

**Pass criteria:** Only the character written after re-enabling TX is transmitted (transmitted data = new written data).

### 13. vsuart_rx_basic_test_test { #test-13 }

**Covered items:** F2.1.3.2, F2.5.2.1, F2.5.2.3, F2.5.4.1  
**Method:** Self-check TM  
**Priority:** High

Verify reception on rx, RX FIFO read via APB and back-to-back reception.

**Pass criteria:** Read data = data sent on rx, in the same order; no frame is lost; FRERR=0, PRERR=0; RBDSTA=0 after the last read.

### 14. vsuart_rx_frame_formats_test { #test-14 }

**Covered items:** F2.5.2.2  
**Method:** Self-check TM  
**Priority:** High

**Finished date in test plan:** `26/10/28`; **Status: PASS** (confirmed by the project owner).

Verify reception in all frame formats (8/9 data bits, none/even/odd parity, 1/2 stop bits).

**Pass criteria:** PRDATA[7:0] (8-bit mode) or PRDATA[8:0] (9-bit mode) = data sent on rx; FRERR=0, PRERR=0.

### 15. vsuart_rx_baud_drift_test { #test-15 }

**Covered items:** F2.5.1.1  
**Method:** Self-check TM  
**Priority:** Medium

Verify reception with +-2% baud rate mismatch on rx.

**Pass criteria:** Read data = data sent on rx for all frames; FRERR=0, PRERR=0.

### 16. vsuart_rx_enable_disable_test { #test-16 }

**Covered items:** F2.5.2.4  
**Method:** Self-check TM  
**Priority:** Medium

Verify that rx is ignored while UEN[1]=0.

**Pass criteria:** No data is stored while UEN[1]=0; after re-enabling, read data = data sent on rx.

### 17. vsuart_rx_fifo_full_overflow_test { #test-17 }

**Covered items:** F2.5.4.2, F2.5.4.3, F2.5.6.3  
**Method:** Self-check TM  
**Priority:** Medium

Verify RX FIFO boundaries, the full interrupt (RXISEL=2'b11) and RX FIFO overflow (RBOSTA).

**Pass criteria:** Read data = the first 128 characters sent, in order; the 129th character is dropped; RXIFS asserts at 128 stored characters; RBOSTA asserts only on the 129th frame.

### 18. vsuart_rx_fifo_underflow_test { #test-18 }

**Covered items:** F2.1.2.2, F2.5.4.4  
**Method:** Self-check TM  
**Priority:** Medium

Verify PSLVERR on reading an empty RX FIFO.

**Pass criteria:** Reading an empty RX FIFO gives PSLVERR=1 and does not change the FIFO; a valid read returns the data sent on rx.

### 19. vsuart_rx_irq_test { #test-19 }

**Covered items:** F2.5.6.1, F2.5.6.2  
**Method:** Self-check TM  
**Priority:** Medium

Verify RX interrupt generation for RXISEL=2'b0x and 2'b10.

**Pass criteria:** RXIFS and ifs_rx assert at the RX FIFO level selected by RXISEL (1 or 96 characters) and de-assert after writing 1 to IFS[8].

### 20. vsuart_rx_error_detect_test { #test-20 }

**Covered items:** F2.2.2.1, F2.5.3.1, F2.5.3.2  
**Method:** Self-check TM  
**Priority:** Medium

Verify framing and parity error detection and read-to-clear of FRERR / PRERR.

**Pass criteria:** Each invalid frame sets the expected STA error bit and ERRIFS; reading STA clears FRERR/PRERR; writing 1 to IFS[16] clears ERRIFS and ifs_err.

### 21. vsuart_irq_w1c_clear_test { #test-21 }

**Covered items:** F2.2.3.1, F2.6.1.1  
**Method:** Self-check TM  
**Priority:** Medium

Verify write-1-to-clear of IFS bits and de-assertion of the interrupt pins.

**Pass criteria:** Writing 1 clears only the selected flag; writing 0 has no effect; each interrupt pin de-asserts after its flag is cleared.

### 22. vsuart_clock_cdc_test { #test-22 }

**Covered items:** F1.1.1, F1.1.2, F2.4.3, F2.5.5.1  
**Method:** Waveform + Self-check TM  
**Priority:** Medium

Verify TX and RX data transfer between PCLK and sys_clk domains for every clock configuration.

**Pass criteria:** Clock frequencies match 5. Clock Value; transmitted data = written data and read data = data sent on rx, in order, for every clock row.

### 23. vsuart_full_duplex_test { #test-23 }

**Covered items:** F2.1.3.3  
**Method:** Scoreboard  
**Priority:** High

Verify simultaneous transmission and reception with independent data streams.

**Pass criteria:** Transmitted data = written data and read data = data sent on rx, both in order, without loss; final status shows TX/RX idle and empty FIFOs.
