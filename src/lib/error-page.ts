export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load — World TEBMA Federation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      :root { --paper: #fbfbf9; --ink: #1b1c1f; --muted: #6b6d73; --border: #e2e2e0; --brand: #a33421; }
      * { box-sizing: border-box; }
      body { font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif; background: var(--paper); color: var(--ink); margin: 0; min-height: 100vh; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
      header, footer { border-color: var(--border); }
      header { border-bottom: 1px solid var(--border); }
      footer { border-top: 1px solid var(--border); }
      .bar { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      header .bar { height: 4rem; }
      footer .bar { padding-top: 1.5rem; padding-bottom: 1.5rem; }
      .brand { display: flex; align-items: center; gap: .5rem; text-decoration: none; color: inherit; }
      .mark { width: 20px; height: 20px; background: var(--ink); border-radius: 2px; }
      .kicker { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .15em; }
      main { flex: 1; display: flex; align-items: center; }
      .wrap { max-width: 80rem; width: 100%; margin: 0 auto; padding: 6rem 1.5rem; display: grid; gap: 2.5rem; grid-template-columns: 1fr; }
      @media (min-width: 768px) { .wrap { grid-template-columns: 1fr 1.2fr; align-items: center; } }
      .code { font-size: clamp(7rem, 14vw, 10rem); line-height: .85; font-weight: 500; letter-spacing: -.05em; margin: 0; }
      .rule { display: block; width: 6rem; height: 1px; background: var(--brand); margin-top: 1rem; }
      h1 { font-size: 2rem; font-weight: 500; letter-spacing: -.02em; margin: 0; }
      p { color: var(--muted); line-height: 1.6; margin: 1rem 0 0; }
      .muted { color: var(--muted); }
      .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
      a.btn, button.btn { padding: .625rem 1.25rem; border-radius: 2px; font: inherit; font-size: .875rem; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: var(--ink); color: var(--paper); }
      .secondary { background: transparent; color: var(--ink); border-color: var(--border); }
      footer a { font-size: 10px; text-transform: uppercase; letter-spacing: .15em; color: var(--muted); text-decoration: none; margin-left: 1.5rem; }
    </style>
  </head>
  <body>
    <header>
      <div class="bar">
        <a class="brand" href="/"><span class="mark"></span><span class="kicker">World TEBMA Federation</span></a>
      </div>
    </header>
    <main>
      <div class="wrap">
        <div>
          <div class="code">500</div>
          <span class="rule"></span>
        </div>
        <div>
          <div class="kicker muted" style="margin-bottom:1rem">World TEBMA Federation</div>
          <h1>This page didn't load</h1>
          <p>An unexpected error interrupted this request. You can retry, or return to the federation homepage.</p>
          <div class="actions">
            <button class="btn primary" onclick="location.reload()">Try again</button>
            <a class="btn secondary" href="/">Go home</a>
            <a class="btn secondary" href="/contact">Contact HQ</a>
          </div>
        </div>
      </div>
    </main>
    <footer>
      <div class="bar">
        <span class="kicker muted">&copy; World TEBMA Federation</span>
        <span><a href="/verify">Verify</a><a href="/news">News</a><a href="/contact">Contact</a></span>
      </div>
    </footer>
  </body>
</html>`;
}
