import { useState } from "react";

const PROMPT_TEXT = `# AI Fluency Index — Personal Assessment Prompt

Please generate a personal **AI Fluency Index** assessment report for me.

---

## Background

In February 2026, Anthropic published the [AI Fluency Index](https://www.anthropic.com/research/AI-fluency-index) research report. Based on the **4D AI Fluency Framework** (developed by Rick Dakan and Joseph Feller), the study analyzed 9,830 Claude.ai conversations across **11 directly observable AI fluency behavior indicators**.

I would like you to use the same framework to evaluate me.

---

## What You Need to Do

### Step 1 — Retrieve My Conversation History at Scale

Use the \`recent_chats\` and \`conversation_search\` tools to retrieve as many of my past conversations as possible (at least 30–40). Specifically:

1. Start with \`recent_chats (n=20)\` to get the 20 most recent conversations.
2. Use the \`before\` parameter to paginate back and retrieve an earlier batch of 20.
3. Use \`conversation_search\` with keywords such as \`"push back"\`, \`"correct"\`, \`"wrong"\`, \`"format"\`, \`"example"\`, \`"specify"\`, etc. to surface any key conversations that pagination may have missed.
4. Do not rely solely on summaries — focus on my specific behavioral patterns within the conversations themselves.

---

### Step 2 — Score Each of the 11 Behavior Indicators

For each of the 11 indicators below, find supporting evidence from my conversation history, assign a percentage score (0–100%), compare it against the population baseline, and write a one-sentence qualitative insight.

| Behavior Indicator | Category | Population Baseline | Description |
|---|---|---|---|
| **Iteration & Refinement** | Description | 85.7% | Does the user follow up, revise, and refine rather than accept the first response? |
| **Provide Context** | Description | 68% | Does the user proactively supply background information, constraints, and relevant materials? |
| **Clarify Goal** | Description | 55% | Does the user clearly articulate what they want, and correct Claude when it misunderstands? |
| **Delegate Tasks** | Delegation | 50% | Does the user assign concrete tasks for Claude to execute (rather than merely asking questions)? |
| **Specify Format** | Description | 40% | Does the user make explicit requests about output format, length, or structure? |
| **Adjust Scope** | Delegation | 35% | Does the user decompose complex tasks or adjust task granularity? |
| **Set Interaction Terms** | Description | 30% | Does the user tell Claude how to interact (e.g., "push back on me", "reply in Chinese")? |
| **Provide Examples** | Description | 25% | Does the user supply reference examples, templates, or "do it like this" instructions? |
| **Check Facts** | Discernment | 20% | Does the user verify Claude's factual claims or point out errors? |
| **Question Reasoning** | Discernment | 18% | Does the user challenge Claude's logic or ask "why"? |
| **Identify Missing Context** | Discernment | 15% | Does the user point out key information Claude overlooked or incorrect assumptions Claude made? |

**Scoring principles:**
- The percentage represents how frequently the behavior appears across your sampled conversations.
- For each indicator, list **3–5 specific pieces of conversational evidence** (cite actual conversation content — do not fabricate).
- Write **one qualitative insight** per indicator.

---

### Step 3 — Generate an Interactive React Dashboard

Create a \`.jsx\` file as an Artifact containing:

1. **Radar Chart** — Display all 11 indicators with my scores vs. the population baseline overlaid as two layers.
2. **Composite Score** — The mean across all 11 indicators, plus sub-averages for each of the three categories: Description / Delegation / Discernment.
3. **Expandable Indicator Cards** — Each card shows:
   - Indicator name with category color tag
   - Comparative bar chart: my score vs. population baseline
   - Delta from population (+X pp) and rate multiple (X.Xx population rate)
   - On click/expand: qualitative insight + list of specific conversational evidence
4. **Category Filter** — Filter cards by Description / Delegation / Discernment.
5. **Key Finding** — Highlight the single most prominent pattern identified.
6. **Methodology Note** — Include: sample size, time range, framework source, and an explicit disclaimer about the limitations of self-assessment.

**Design specifications:**
- Use a clean, professional color palette of your choice
- Use \`JetBrains Mono\` for all numeric/data display elements
- Do **not** use \`localStorage\`

---

## Important Reminders

- Base your evaluation **only** on conversations you actually retrieved — do not fabricate evidence.
- In the methodology section, explicitly state: *this is Claude self-assessing the user, which introduces inherent bias.*
- The population baseline data comes from Anthropic's January 2026 study (n = 9,830); my personal sample is far smaller.
- If evidence for a given indicator is insufficient, **honestly note this** rather than speculating.
- Anthropic's report publishes only population means, not distributional data — therefore **percentile rankings cannot be calculated**.`;

const BEHAVIORS = [
  { id: "iteration", name: "Iteration & Refinement", category: "Description", score: 96, population: 85.7 },
  { id: "context", name: "Provide Context", category: "Description", score: 92, population: 68 },
  { id: "goal", name: "Clarify Goal", category: "Description", score: 88, population: 55 },
  { id: "delegate", name: "Delegate Tasks", category: "Delegation", score: 85, population: 50 },
  { id: "format", name: "Specify Format", category: "Description", score: 78, population: 40 },
  { id: "interaction", name: "Set Interaction Terms", category: "Description", score: 65, population: 30 },
  { id: "examples", name: "Provide Examples", category: "Description", score: 52, population: 25 },
  { id: "facts", name: "Check Facts", category: "Discernment", score: 68, population: 20 },
  { id: "reasoning", name: "Question Reasoning", category: "Discernment", score: 62, population: 18 },
  { id: "missing", name: "Identify Missing Context", category: "Discernment", score: 58, population: 15 },
  { id: "scope", name: "Adjust Scope", category: "Delegation", score: 72, population: 35 },
];

const CATEGORIES = [
  { name: "Description", color: "#115e59", label: "Description" },
  { name: "Delegation", color: "#0d9488", label: "Delegation" },
  { name: "Discernment", color: "#042f2e", label: "Discernment" },
];

function getCatColor(category) {
  return CATEGORIES.find((c) => c.name === category)?.color || "#115e59";
}

function RadarChart({ data, size = 340 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 48;
  const n = data.length;

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const getLabelPoint = (index) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const dist = r + 24;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const gridLevels = [25, 50, 75, 100];

  const makePath = (getter) =>
    data.map((d, i) => {
      const p = getter(d, i);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    }).join(" ") + " Z";

  const populationPath = makePath((d, i) => getPoint(i, d.population));
  const scorePath = makePath((d, i) => getPoint(i, d.score));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size }}>
      {/* Grid */}
      {gridLevels.map((level) => (
        <path
          key={level}
          d={makePath((_, i) => getPoint(i, level))}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="0.75"
        />
      ))}
      {/* Spokes */}
      {data.map((_, i) => {
        const p = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="0.5" />;
      })}
      {/* Population area */}
      <path d={populationPath} fill="rgba(148,163,184,0.1)" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Score area */}
      <path d={scorePath} fill="rgba(17,94,89,0.1)" stroke="#115e59" strokeWidth="2" />
      {/* Score dots */}
      {data.map((d, i) => {
        const p = getPoint(i, d.score);
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={getCatColor(d.category)} stroke="#ffffff" strokeWidth="1.5" />;
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const lp = getLabelPoint(i);
        const short = d.name.length > 14 ? d.name.slice(0, 12) + "..." : d.name;
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748b"
            fontSize="8"
          >
            {short}
          </text>
        );
      })}
    </svg>
  );
}

export default function AIFluencyIndex() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overall = Math.round(BEHAVIORS.reduce((s, b) => s + b.score, 0) / BEHAVIORS.length);
  const overallPop = Math.round(BEHAVIORS.reduce((s, b) => s + b.population, 0) / BEHAVIORS.length);

  const categoryScores = CATEGORIES.map((cat) => {
    const items = BEHAVIORS.filter((b) => b.category === cat.name);
    return {
      ...cat,
      avg: Math.round(items.reduce((s, b) => s + b.score, 0) / items.length),
      popAvg: Math.round(items.reduce((s, b) => s + b.population, 0) / items.length),
    };
  });

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#115e59", marginBottom: "0.5rem" }}>
        AI Fluency Index
      </h2>
      <p style={{ fontSize: "0.875rem", color: "rgba(0,0,0,0.5)", marginBottom: "2rem", lineHeight: 1.7 }}>
        The <a href="https://www.anthropic.com/research/AI-fluency-index" target="_blank" rel="noopener noreferrer" style={{ color: "#115e59", textDecoration: "underline", textUnderlineOffset: "2px" }}>AI Fluency Index</a> is a research framework developed by Professors Rick Dakan and Joseph Feller in collaboration with Anthropic. It measures 11 observable behaviors across three dimensions — Description, Delegation, and Discernment — that characterize effective human-AI collaboration, baselined against 9,830 Claude.ai conversations. Below is my personal profile scored across ~40 of my own conversations.
      </p>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Radar Chart */}
        <div style={{ flex: "1 1 320px", maxWidth: 400 }}>
          <RadarChart data={BEHAVIORS} />
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.5rem", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: 16, height: 2, background: "#115e59" }} />
              <span style={{ color: "#64748b" }}>My score</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: 16, height: 2, background: "#cbd5e1", borderTop: "1px dashed #cbd5e1" }} />
              <span style={{ color: "#64748b" }}>Population avg</span>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div style={{ flex: "1 1 280px" }}>
          {/* Composite */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.25rem" }}>
              Composite Score
            </div>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#115e59", lineHeight: 1.1 }}>
              {overall}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.125rem" }}>
              vs. {overallPop} population avg
            </div>
          </div>

          {/* Category scores */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {categoryScores.map((cat) => (
              <div
                key={cat.name}
                style={{
                  flex: 1,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "0.75rem 0.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: cat.color, lineHeight: 1.1 }}>
                  {cat.avg}
                </div>
                <div style={{ fontSize: "0.625rem", color: "#94a3b8", marginTop: "0.125rem" }}>
                  vs. {cat.popAvg}
                </div>
                <div style={{ fontSize: "0.625rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem" }}>
                  {cat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Key Finding */}
          <div style={{
            background: "#f0fdfa",
            border: "1px solid #ccfbf1",
            borderRadius: 8,
            padding: "0.875rem 1rem",
          }}>
            <div style={{ fontSize: "0.7rem", color: "#115e59", fontWeight: 600, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Key Finding
            </div>
            <p style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.6, margin: 0 }}>
              Discernment score ({categoryScores[2].avg}%) is {(categoryScores[2].avg / categoryScores[2].popAvg).toFixed(1)}x the population average — fact-checking, questioning reasoning, and catching missing context at 3–4x typical rates.
            </p>
          </div>

          {/* Source note */}
          <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.75rem", lineHeight: 1.5 }}>
            Framework: Anthropic 4D AI Fluency (Dakan & Feller, 2026). Baselines from 9,830 conversations.
          </p>
        </div>
      </div>

      {/* Get Your Own */}
      <div style={{
        marginTop: "2rem",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "1.25rem 1.5rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#115e59", margin: 0 }}>
              Get Your Own AI Fluency Index
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0.25rem 0 0", lineHeight: 1.5 }}>
              I engineered the prompt below from the original research paper — it turns a static publication into a reproducible self-assessment anyone can run. Paste it into a new <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{ color: "#115e59", textDecoration: "underline", textUnderlineOffset: "2px" }}>Claude.ai</a> conversation to generate your own dashboard.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem",
                color: "#115e59",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {showPrompt ? "Hide Prompt" : "View Prompt"}
            </button>
            <button
              onClick={handleCopy}
              style={{
                background: "#115e59",
                border: "none",
                borderRadius: 6,
                padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 500,
                transition: "background 0.2s",
              }}
            >
              {copied ? "Copied!" : "Copy Prompt"}
            </button>
          </div>
        </div>

        {showPrompt && (
          <pre style={{
            marginTop: "1rem",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "1rem",
            fontSize: "0.75rem",
            lineHeight: 1.6,
            color: "#334155",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 400,
            overflowY: "auto",
          }}>
            {PROMPT_TEXT}
          </pre>
        )}
      </div>
    </div>
  );
}
