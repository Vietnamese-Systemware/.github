---
title: VSUART Documentation
---

# VSUART: UART IP Documentation

VSUART (Vietnamese Systemware UART) is a configurable UART IP with an APB4 slave interface, implemented in SystemVerilog. This documentation covers the peripheral interface, RTL architecture, and UVM 1.2 verification environment.

## Overview

The IP provides separate transmit and receive paths with FIFO buffering, programmable baud generation, configurable frame formats, and TX, RX, and error interrupt outputs. Control and status registers are accessed through the APB interface.

The design separates the APB and UART clock domains. A programmable prescaler derives the internal UART clock from the system clock. See [RTL architecture](design/architecture.md) for the module structure and data paths.

## Organization of this documentation

The documentation is organized into the following sections.

### Specification

The specification pages describe the externally visible behavior of the peripheral:

- [Features & frame formats](specification/features.md): supported configurations, frame encoding, and the interactive frame explorer.
- [Interfaces & clocks](specification/interfaces.md): APB signals, serial ports, resets, and clock requirements.
- [Register map](specification/registers.md): offsets, fields, reset values, and access policies.
- [Clock & baud rate](specification/baudrate.md): timing equations, reference configurations, and the baud rate calculator.
- [UART operation](specification/operation.md): configuration, enable sequencing, transmission, and reception.
- [Interrupts & errors](specification/interrupts.md): trigger selection, status flags, and interrupt servicing.

### RTL design

The [Architecture](design/architecture.md) describes the APB subsystem, TX/RX engines, asynchronous FIFOs, clock-domain crossings, and top-level parameters. It combines the design document with implementation references from the local source tree.

### Verification

The [UVM environment](verification/environment.md) presents the environment diagram and component responsibilities. [Tests](verification/tests.md) lists the 23 scenarios from the verification test plan and their execution status.

## Key parameters

| Item | Project specification |
| --- | --- |
| Host interface | APB4 slave; 16-bit address, 32-bit data, four byte strobes |
| Serial data | 8 bits with no, odd, or even parity; 9 bits with no parity |
| Stop bits | One or two |
| RX oversampling | 4× or 16× |
| FIFO capacity | Up to 128 entries; top-level default 128 × 9 bits |
| Register bank | Seven 32-bit CSRs at `0x0000`–`0x0018` |
| FIFO data port | `0xFFFF`: write TX data or read RX data |
| Interrupt outputs | TX, RX, and error |
| System clock | 40–200 MHz |
| APB clock | At most 72 MHz; satisfy `Fsys > Fpclk > Fu` |
