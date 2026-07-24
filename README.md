# XIAO Lab — Four-DUT Monitor

A public Web Serial monitor for four passive DUTs connected to one Seeed Studio
XIAO RP2040. The site sends a built-in MicroPython scanner through the raw REPL,
plots four raw ADC histories, retains eight hours per channel, exports CSV data,
and exposes a collapsible serial debug console.

## Wiring

Each DUT uses one source GPIO, one ADC input, and a 1 kΩ series protection
resistor. The scanner enables the RP2040's internal pull-down on all four ADC
GPIOs, so no external pull-down resistors are required:

| DUT | Source path | ADC node |
| --- | --- | --- |
| DUT 1 | D4 / GPIO6 → 1 kΩ → DUT 1 | D0 / GPIO26, internal pull-down |
| DUT 2 | D5 / GPIO7 → 1 kΩ → DUT 2 | D1 / GPIO27, internal pull-down |
| DUT 3 | D6 / GPIO0 → 1 kΩ → DUT 3 | D2 / GPIO28, internal pull-down |
| DUT 4 | D7 / GPIO1 → 1 kΩ → DUT 4 | D3 / GPIO29, internal pull-down |

The DUTs must be passive and isolated. Do not apply an external voltage or more
than 3.3 V to D0–D3. The internal pull-down is not a precision resistor, so the
monitor reports raw comparative ADC values rather than calculated resistance.

## Run locally

Requirements:

- Node.js 22.13 or newer
- Chrome or Edge for Web Serial
- A data-capable USB cable
- MicroPython installed on the XIAO RP2040

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, click **Connect XIAO**, choose the USB serial port,
then click **Run all four**.

## Serial protocol

The scanner energizes one DUT at a time, averages 10 ADC reads, releases the
source pin, and emits one synchronized record:

```text
DATA,12345,23456,34567,45678
```

The browser stores the values under DUT1 through DUT4 with the same timestamp.
Every graph uses the same fixed 0–65,535 y-axis so the four channels can be
compared directly. The scanner sleeps 500 ms between complete scans and
continues until **Stop monitor** is pressed. Stop immediately freezes all four
graphs and returns every source GPIO to high impedance.

## Useful commands

- `npm run dev` — start the local app
- `npm run build` — verify the production build
- `npm test` — build and verify the rendered app
