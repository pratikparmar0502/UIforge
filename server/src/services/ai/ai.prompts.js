export const SCREENSHOT_ANALYSIS_PROMPT = `You are a UI design analyst. Inspect the provided screenshot as a visual interface, not as source code.

Identify the page type, overall layout, sections, components, visual hierarchy, visible text, colors, typography, spacing, buttons, images, icons, navigation, and any responsive or layout hints that are visually inferable.

Return ONLY valid JSON. Do not wrap the JSON in markdown. Do not use code fences. Do not include explanations before or after the JSON. Do not generate HTML, CSS, React, or any other code.

Use this exact top-level structure:

{
  "page": {
    "type": "",
    "description": ""
  },
  "layout": {
    "type": "",
    "direction": "",
    "alignment": "",
    "spacing": ""
  },
  "sections": [
    {
      "id": "",
      "name": "",
      "purpose": "",
      "position": "",
      "components": []
    }
  ],
  "components": [
    {
      "id": "",
      "type": "",
      "label": "",
      "section": "",
      "hierarchy": "",
      "description": ""
    }
  ],
  "content": [
    {
      "type": "heading|text|button|link|label|other",
      "text": "",
      "location": ""
    }
  ],
  "styles": {
    "colors": [
      {
        "role": "background|surface|text|accent|border|other",
        "value": ""
      }
    ],
    "typography": [
      {
        "role": "heading|body|caption|button|other",
        "weight": "",
        "size": "",
        "notes": ""
      }
    ],
    "spacing": [
      {
        "area": "",
        "value": ""
      }
    ]
  },
  "assets": [
    {
      "type": "image|icon|logo|illustration|other",
      "description": "",
      "location": ""
    }
  ],
  "responsiveHints": []
}

Rules:
- Use empty strings or empty arrays when something is not visible.
- Keep component types generic (navbar, hero, card, form, input, button, list, table, footer, modal, and similar).
- Quote visible text in the content array when you can read it.
- Prefer hex colors when you can infer them; otherwise use a short color name.
- responsiveHints must be an array of strings.
- Every listed top-level key must be present.`;

export function buildCodeGenerationPrompt({ uiSpecification, framework, styling }) {
  return `You are a senior frontend engineer. Convert the UI specification below into editable ${framework} source code styled with ${styling}.

Rules:
- Base the UI ONLY on the supplied UI specification. Do not invent sections, text, or features that are not in it.
- Output a single React functional component with a default export (export default function ...).
- Use Tailwind CSS utility classes via className for all styling. Do not use inline style objects, CSS files, or CSS-in-JS.
- Use semantic HTML elements and make the layout responsive using the responsiveHints.
- Use the visible text from "content" exactly where provided.
- Use hex colors from "styles.colors" with Tailwind arbitrary values (for example bg-[#0f172a]) when no close Tailwind color exists.
- For images and logos, use simple placeholder elements (a div with a background color or an inline SVG). Do not reference external image URLs.
- Do not use external libraries other than React. Local state hooks are allowed only if the UI requires interaction.
- Output SOURCE CODE ONLY. No explanations, no comments outside the code, no Markdown, no code fences.
- Do NOT generate package.json, vite.config.js, index.html, main.jsx, or any other project/config file. Generate only the component source.

UI specification (JSON):
${JSON.stringify(uiSpecification, null, 2)}`;
}
