# UVM verification environment

TestEnv organizes the testbench around clock/reset, APB, UART, interrupt monitoring, and a register environment. The current `vsuart_env` also connects a scoreboard to the transaction monitors.

## Environment diagram

[![Original verification environment diagram from TestEnv sheet 3](../assets/source/testenv-architecture.png)](../assets/source/testenv-architecture.png)

Open the image for the full-resolution diagram extracted from the workbook. Some RAL connections have since moved to the parent environment in the source.

## Components

| Component | Responsibility | Evidence |
| --- | --- | --- |
| `tb_vsuart` | Instantiate DUT/interfaces, publish virtual interfaces through config_db, call `run_test()` | Testbench source |
| `clk_rst_agt` | Generate clocks/reset and monitor reset events | TestEnv sheet 4 and source |
| `apb_mst_agt` | APB sequencer, driver, and monitor | Workbook diagram and VLSI_COMMON |
| `uart_agt` | UART stimulus and TX/RX monitoring | Workbook diagram and source |
| `ifs_agt` | Monitor interrupt outputs | Workbook diagram and source |
| `ral_env` | Register block, adapter, predictor, and reset subscriber | TestEnv sheet 7 |
| `vsuart_scb` | Compare APB payloads with UART transactions | `vsuart_scb.sv` |
| `vsuart_cfg` | Share configuration across the environment | `vsuart_cfg.sv` |

Sheets `5. apb_mst_env`, `6. uart_env`, and `8. ifs_env` currently contain only headings. The component descriptions above are supported by the diagram and source.

Sources: [TestEnv workbook](../downloads/VSUART_TestEnv.xlsx), `1_tb/tb_vsuart.sv`, `1_tb/uvm/env/vsuart_env/vsuart_env.sv`, and `vsuart_scb.sv`.
