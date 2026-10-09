# Deploying the AI Tutor function

The app never talks to Google directly: it asks this small function (`worker/index.ts`), which holds the Gemini API key and answers from the course notes. The function runs on Cloudflare Workers' free plan. You do these steps once.

You need: a Google account, a free Cloudflare account, and Node installed (you already have it if `npm run dev` works).

## 1. Get a Gemini API key (free)

1. Go to <https://aistudio.google.com/apikey> and sign in with a Google account (use one that belongs to the team, and an adult account: the free tier is for people 18 and over).
2. Click **Create API key** and pick (or create) a project.
3. Copy the key. Treat it like a password: do not paste it into chat, a file in the repo, or a screenshot.
4. **Do not turn on billing** for that project. Without billing the free tier simply stops when the limit is reached, so there can be no surprise charge.
5. In AI Studio, open the model list and check that `gemini-3.5-flash-lite` is there. If Google has renamed it, put the new name in `TUTOR_MODEL` in `worker/wrangler.toml` (step 5).

## 2. Make a Cloudflare account

Sign up at <https://dash.cloudflare.com/sign-up>. The free plan needs no card.

## 3. Deploy

Run these from the project folder (the one with `package.json`).

```bash
npx wrangler login
npx wrangler deploy --config worker/wrangler.toml
```

`login` opens a browser window to connect your Cloudflare account. `deploy` prints the address of your function, something like `https://qisket-tutor.your-name.workers.dev`. Keep it.

Now store the key as a secret (it is encrypted on Cloudflare and never appears in the repo or the app):

```bash
npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.toml
```

Paste the key when asked.

## 4. Check that it works

Open `https://qisket-tutor.your-name.workers.dev/api/health` in a browser. You should see `"configured":true`. If it says `false`, the secret was not saved: repeat the `secret put` step.

## 5. Point the app at it

Create a file called `.env.local` in the project folder (git ignores it) with one line:

```
VITE_TUTOR_URL=https://qisket-tutor.your-name.workers.dev/api/tutor
```

Then restart `npm run dev`. Open **Ask Tutor**, choose **Use online tutor** and ask something. The label under an answer says where it came from: "AI answer" means Gemini wrote it.

For a build that other people will install, build with that value set (the same `.env.local` works on your own computer):

```bash
npm run build
npm run check:no-keys
npm run cap:sync
```

`check:no-keys` must say "No API keys found" before you share a build. If the website is built somewhere else (not on your computer), set `VITE_TUTOR_URL` as a build setting there.

## 6. Let your website call it

The function only accepts browsers coming from addresses listed in `ALLOWED_ORIGINS` in `worker/wrangler.toml`. The Android app (`https://localhost`) and local development (`http://localhost:5173`) are already there. When you publish the website, add its address (no slash at the end), for example:

```
ALLOWED_ORIGINS = "https://localhost,http://localhost:5173,https://your-team.github.io"
```

and deploy again (`npx wrangler deploy --config worker/wrangler.toml`).

## 7. Run the 20-question test

```bash
# macOS / Linux / Git Bash
TUTOR_URL=https://qisket-tutor.your-name.workers.dev/api/tutor npm run tutor:eval
```

```powershell
# Windows PowerShell
$env:TUTOR_URL = "https://qisket-tutor.your-name.workers.dev/api/tutor"; npm run tutor:eval
```

It asks all 20 questions (it waits between them because the function allows 10 a minute, so it takes about two and a half minutes) and prints each answer with `ok` or `FAIL`. Read the answers yourself too: a pass on the written checks is a good sign, not a proof.

## If something goes wrong

| What you see | What it means and what to do |
| --- | --- |
| Answers say "(could not reach the online tutor)" | Open `.../api/health` in a browser: if it does not load, the function is down or the address in `.env.local` is wrong. If it loads, look at the cause the function reports: run `npx wrangler tail --config worker/wrangler.toml` in a second terminal and ask a question. |
| The log says `bad_request 400: User location is not supported for the API use` | Google refuses calls that leave from some Cloudflare data centres (the free tier is not offered from Europe, for example, and the nearest data centre to a learner can be one of those). `worker/wrangler.toml` already has a `[placement]` setting that makes the function run near Google's US region. To check it, run `curl -i <your address>/api/health` and look for the header `Cf-Placement: remote-IAD` (or another `remote-` code in the US). The `entry` value in the reply is only where the request came in, so it can be anywhere. If the header says `local-` or the error still appears, check the `[placement]` lines are there, deploy again, or try another region (for example `aws:us-east-1`). |
| `429` or "busy" | The free quota is used up for now (see below). |
| The site on your own computer cannot reach it | The address of your site (for example `http://localhost:5173`) must be allowed. Any `http://localhost` port is allowed automatically; for a real website add it to `ALLOWED_ORIGINS`. |

## Settings you can change later

Edit `worker/wrangler.toml`, then deploy again.

| Setting | What it does |
| --- | --- |
| `TUTOR_MODEL` | The Gemini model code. Change it if Google renames or retires the model. |
| `ALLOWED_ORIGINS` | Which websites and apps may call the function. `http://localhost` on any port is always allowed, so you only list `https://localhost` (the Android app) and your real website. |
| `[placement]` `region` | Where the function runs. Keep it near the US (see above). |
| `RATE_PER_MINUTE`, `RATE_PER_DAY`, `GLOBAL_PER_DAY` | Optional. Per person per minute (default 10), per person per day (60), and everyone per day (800). Add them under `[vars]` as text, for example `RATE_PER_DAY = "100"`. |
| `TUTOR_TEMPERATURE` | Optional. Left unset on purpose: Google recommends the default for Gemini 3 models. |

## When the free limit runs out

Gemini answers with an error called 429 when the free quota is used up. The function then waits a minute before trying again, and in the meantime the app answers from the course notes on the device, with a message saying the online tutor is busy. Nothing breaks. The limits are per Google project and are shown in AI Studio under "Rate limit". Please do not create extra Google accounts or projects to get more free quota; if you need more, turn on billing for one project.

## Good to know

- The per-person and global limits are counted in memory by each running copy of the function, so they are a polite brake, not a hard guarantee. The real protection is that the key has no billing attached.
- Questions go to Google's free tier, which may use them to improve Google's products. The app says so before the first online question. Before a public release, check Google's terms for the free tier: it is for adults, and for users in the EEA, UK and Switzerland the terms ask for the paid service.
- If the key is ever leaked, delete it in AI Studio, make a new one, and run the `secret put` step again.
- To watch the function's logs: `npx wrangler tail --config worker/wrangler.toml`.
