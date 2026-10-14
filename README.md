# Neway source and AI setup

The front end is ordinary HTML (app/site.html), CSS (public/styles.css), and JavaScript (public/site.js). Its 102 textbook entries are separate data, not extra AI code. No external front-end framework is needed to run the exported front end. Open index.html after extracting the ZIP to try the book search, photos, navigation and circle experiment. The source viewer and AI require a web server.

The deployed project uses the Sites Vinext server to serve the HTML and /api/tutor. The small server handler connects to a separately hosted Gemini model; model knowledge does not live inside the website code. Browser code contains no API key. Students get answers in the page, without links to ChatGPT. The existing private site's access gateway may still require the owner's ChatGPT sign-in; private hosting authentication is separate from the AI conversation.

LIVE AI IS NOT ACTIVE. Configure GEMINI_API_KEY as a private Sites runtime secret, optionally GEMINI_MODEL (default gemini-2.5-flash), and NEWAY_AI_ENABLED=true. Model/search usage is provider-billed. Do not put API keys in HTML, JavaScript, public files, or Git. The code does not include a model, key, or entitlement to free usage.

The assistant accepts a grade, optional subject, question and bounded recent conversation. It picks a relevant reference from the grade's catalog automatically. It uses Gemini URL context plus Google Search when connected; it distinguishes textbook wording from current knowledge and checks changing facts such as moon counts. There is no fully indexed school-specific corpus yet. Not every source can be read by the provider. Unverified textbook context is labelled general learning help; no book passages or page numbers should be invented. The model is not guaranteed accurate or equivalent to ChatGPT. Teacher approval of editions is still needed.

Book-finding in the chat is a separately labelled local catalog lookup, so finding PDFs does not need AI. Other unavailable AI requests return a connection notice, not a simulated answer.

Server safeguards: hosted sign-in, same-origin POST, bounded body and question length, catalog-owned reference URLs, allowed history roles, secret kept server-side, best-effort per-isolate throttling, and timeout handling. Add persistent per-user quotas and a provider spending cap before broadly sharing the AI. There are no public content-editing or file-upload endpoints.

The ZIP's server files are the hosted application's server source, not a standalone Node server. To deploy the exported front end elsewhere, supply an equivalent authenticated /api/tutor route. Serving only HTML/CSS/JS does not activate AI.

Verified by JavaScript syntax, TypeScript build, source/asset checks and targeted tutor context tests. Interactive browser QA and live model calls were unavailable. Sources and font licences remain in the archive.
