import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the XIAO Lab monitor", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>XIAO Lab · Four-DUT ADC Monitor<\/title>/i);
  assert.match(html, /Four-DUT ADC monitor/);
  assert.match(html, /Connect XIAO/);
  assert.match(html, /aria-label="DUT 1 ADC chart/);
  assert.match(html, /aria-label="DUT 2 ADC chart/);
  assert.match(html, /aria-label="DUT 3 ADC chart/);
  assert.match(html, /aria-label="DUT 4 ADC chart/);
  assert.match(html, /Debug console/);
  assert.match(html, /Run all four/);
  assert.match(html, /Wiring guide/);
  assert.match(html, /Show|Hide/);
  assert.doesNotMatch(html, /Lab assistant/);
  assert.doesNotMatch(html, /main\.py/);
  assert.doesNotMatch(html, /Try demo/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /react-loading-skeleton/);
});

test("embeds the four-DUT internal-pull-down scanner", async () => {
  const [page, layout, packageJson, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /navigator/);
  assert.match(page, /requestPort/);
  assert.match(page, /read_u16/);
  assert.match(page, /for _ in range\(10\)/);
  assert.match(page, /values\.append\(total \/\/ 10\)/);
  assert.doesNotMatch(page, /range\(16\)|total \/\/ 16/);
  assert.match(page, /sleep_ms\(500\)/);
  assert.match(page, /while monitoring/);
  assert.match(page, /DATA,\{\},\{\},\{\},\{\}/);
  assert.match(page, /MAX_SAMPLES_PER_DUT = 57_600/);
  assert.match(page, /MAX_DRAW_POINTS = 1_000/);
  assert.match(page, /const ADC_Y_MIN = 0/);
  assert.match(page, /const ADC_Y_MAX = 65_535/);
  assert.match(page, /yTicks: ADC_Y_TICKS/);
  assert.doesNotMatch(page, /rawMin|rawMax|safeMax/);
  assert.match(page, /D4 \/ GPIO6/);
  assert.match(page, /D7 \/ GPIO1/);
  assert.match(page, /Pin\(26, Pin\.IN, Pin\.PULL_DOWN\)/);
  assert.match(page, /Pin\(27, Pin\.IN, Pin\.PULL_DOWN\)/);
  assert.match(page, /Pin\(28, Pin\.IN, Pin\.PULL_DOWN\)/);
  assert.match(page, /Pin\(29, Pin\.IN, Pin\.PULL_DOWN\)/);
  assert.match(page, /ADC\(0\)/);
  assert.match(page, /ADC\(3\)/);
  assert.match(page, /No\s+external pull-down is needed/);
  assert.match(page, /Connect four DUTs/);
  assert.match(page, /\[debugOpen, setDebugOpen\] = useState\(false\)/);
  assert.match(page, /if \(!running\) return/);
  assert.doesNotMatch(page, /while True/);
  assert.doesNotMatch(page, /MONITOR_COMPLETE/);
  assert.doesNotMatch(page, /47\s*kΩ|47k|47_000/i);
  assert.doesNotMatch(readme, /47\s*kΩ|47k|47_000/i);
  assert.match(layout, /XIAO Lab/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
