# Chip Reactor Research Panel — Design

**Date**: 2026-04-27
**Author**: Zeyu (Alban) Li, with brainstorming assistance
**Status**: Approved per section-by-section review; awaiting implementation

## Goal

Add a new research project entry to the portfolio at `https://zeyuli.net/research`
representing the *Nature Sustainability* (in peer review) chip-reactor manuscript:
"A Chip Reactor for Perpetual Nucleic Acid Production and On-chip Information
Processing" (Wang, Li, Li, Han, Sun, Li, Liu, Luo, 2026). Zeyu Li is the second
author.

## Audience and Voice

The portfolio's research page targets industry readers — biotech recruiters,
biomanufacturing scouts, pharma process scientists, AI-pharma engineers — not
academic peer reviewers. All copy must:

- Use first-person plural "we" (team voice, matching existing tracers / hydrogels
  / extraction / surface entries)
- State authorship rank honestly (precedent: surface entry uses "3rd author")
- Use industry vocabulary (cartridge, scale-out vs scale-up, GMP, PAT, lot
  variability, dsRNA impurity) where genuine and accurate
- Avoid academic lineage references (e.g., naming prior lab papers as positioning)
- Avoid em-dash (U+2014) and en-dash (U+2013); use colon, semicolon, parentheses,
  comma, or rewrite (per repo convention)

## Authorial Honesty Constraints

Per the manuscript's published Author Contributions:

> D.W. and D.L. conceived experiments and led the research. D.W. built the
> chip-reactor-based nucleic acid production platform, conducted materials
> characterization, and performed reactor operation and optimization. D.W., Z.L.
> and T.S. prepared template DNA and performed sample characterization. D.W.,
> D.L. and Z.L. analyzed the data and D.W. and D.L. interpretated the result.
> F.L., J.L., and Y.H. performed the cell experiments. P.L., F.L., J.L., and Y.H.
> analyzed and interpreted the cell-experiment data. D.W. and D.L. wrote the
> manuscript with input from the other authors.

Z.L.'s real contribution: device fabrication (NucleoMesh side), template DNA
engineering, biochemical characterization, and data analysis. NOT reactor
platform build (D.W.); NOT cell experiments (Shanghai team).

The role field reflects this scope literally; the body copy uses team voice
("we") consistent with the existing surface entry where Z.L. is also non-lead.

## Position in Project List

Insert as the third project, between `hydrogels` and `extraction`:

1. tracers (1st author, ES&T 2025)
2. hydrogels (co-1st author, ACADIA 2024)
3. **chip-reactor (2nd author, Nature Sustainability in peer review)** ← new
4. extraction (inventor, patent)
5. surface (3rd author, Innovation 2023)

Rationale: authorship rank flows naturally (1st → co-1st → 2nd → inventor → 3rd),
and chip-reactor is technically downstream of hydrogels (DNA-only hydrogel →
DNA+PEG hybrid hydrogel + flow reactor), making the adjacency intellectually
coherent.

## The Project Object

```ts
{
  id: "chip-reactor",
  title: "A Chip Reactor for Perpetual Nucleic Acid Production and On-chip Information Processing",
  shortLabel: "Chip reactor",

  summary: "A continuous-flow chip reactor with covalently immobilized DNA templates (NucleoMesh) sustained 100+ days of perpetual mRNA synthesis at steady-state output, transforming cell-free nucleic-acid production from hours-long batch reactions into months-long continuous flow.",

  problem: "Demand for nucleic-acid therapeutics (mRNA vaccines, siRNA drugs, CRISPR reagents) is outpacing the throughput of today's biomanufacturing. The two dominant routes both hit walls: cell-based fermentation is capped by homeostatic regulation, and cell-free in vitro transcription, the workhorse for mRNA, saturates within hours as substrates deplete, enzymes inactivate, and inhibitory byproducts accumulate. Manufacturers compensate with massive parallel batches, repeated reagent loads, and aggressive purification, each step adding cost, lot variability, and quality risk to drugs where consistency is non-negotiable. Continuous, long-duration production has remained out of reach because every reaction component eventually decays under static conditions.",

  approach: "We took the problem in two architectural moves. First, we engineered NucleoMesh: a polyester-mesh-supported PEG organogel bearing NHS groups that covalently anchor amino-modified DNA templates throughout a porous, mass-transport-friendly hydrogel. Second, we packaged NucleoMesh into a replaceable cartridge by sandwiching it between PDMS spacers and PMMA plates, then drove a continuous flow of T7 RNA polymerase, NTPs, and buffer across the immobilized template surface with syringe pumps. The flow continuously replenishes substrates and sweeps away inhibitory byproducts, keeping local reaction kinetics fresh over arbitrarily long runs. By immobilizing the template rather than the enzyme, we exploit the most stable reaction component and convert template DNA into a reusable, solid-phase catalyst.",

  results: "Three NucleoMesh chip reactors, run in parallel for 7 days, produced six RNA classes (RFP and GFP mRNAs, Mango III aptamer, siRNA, miRNA, hammerhead ribozyme) at steady-state output. A single reactor then ran continuously for 100 days, holding RFP mRNA effluent steady at ~30 ng/μL after startup and yielding milligram-scale product per cartridge by day 100. Gel electrophoresis on days 1, 3, 7, 30, 60, and 100 returned a single sharp full-length band throughout. Against a 300 μL batch IVT (which saturates within 24 hours), chip-reactor template-normalized productivity stayed linear over the full 100-day run, exceeding batch by orders of magnitude on an equivalent-volume basis. Reactor-synthesized products were bioactive: mRNAs translated to fluorescent proteins; siSTAT3 knocked down STAT3 by ~60% in HCT116 cells; anti-miR-33 drove M1-to-M2 macrophage polarization. Crucial for therapeutic-grade RNA, dsRNA impurity stayed well below batch levels across the entire 100-day run. The same platform extended to ssDNA synthesis via isothermal RPA, and three reactors were routed into a three-state FET-like RNA logic gate with fluorescence readout, showing one architecture can serve as both production line and in situ information processor. The work is in peer review at Nature Sustainability and was supported by Cornell University's Moonshot Seed Grant Program.",

  impact: "By rendering the DNA template a reusable, solid-phase catalyst and decoupling reaction lifetime from enzyme decay, the chip reactor reframes cell-free nucleic-acid manufacturing from a high-cost batch operation into a continuous process. Replaceable cartridges enable scale-out by parallelization rather than expensive scale-up; pause-and-resume operation supports on-demand and distributed production. Lower dsRNA impurity reduces downstream purification burden and aligns with regulatory pressure toward continuous biomanufacturing for therapeutic mRNA. Reducing all process variables to flow rates, temperatures, and concentrations creates a hardware substrate naturally suited to AI-augmented closed-loop control. The same architecture supports both production and on-chip RNA logic, opening a path to integrated synthesis-and-sensing modules.",

  nextSteps: "Ongoing work moves the platform toward therapeutic-grade operation: integrating 5' capping, inline concentration and purification, and quality analytics so the cartridge can sit upstream of a GMP-aligned mRNA workflow. In parallel, cartridge-to-cartridge consistency is being tightened through stricter DNA-loading and coupling-yield specifications, and multi-reactor manifolds validated for industrial-scale parallelization. Sensor-instrumented cartridges are being built for closed-loop AI process control, exploiting the platform's reduction of state to flow rate, concentration, and temperature. Longer-term extensions include cell-free protein synthesis on the same hardware and inline RNA logic readout for integrated synthesis-and-sensing diagnostic modules.",

  outcomes: [
    "Manuscript in peer review at Nature Sustainability (2026, second author)",
    "100+ days perpetual mRNA synthesis with milligram-scale cumulative yield per cartridge",
    "Six RNA classes plus ssDNA produced on the same platform",
    "dsRNA impurity sustained below batch IVT across the 100-day run",
    "Supported by Cornell Moonshot Seed Grant Program"
  ],

  role: "Second author; device fabrication, template engineering, and biochemical characterization",

  collaborators: [
    { name: "Dr. Dong Wang", affiliation: "Cornell University", url: "https://cals.cornell.edu/people/dong-wang" },
    { name: "Prof. Dan Luo", affiliation: "Cornell University", url: "https://cals.cornell.edu/people/dan-luo" },
    { name: "Dr. Fengqin Li", affiliation: "Shanghai Jiao Tong University", url: "" },
    { name: "Prof. Peifeng Liu", affiliation: "Shanghai Jiao Tong University", url: "https://www.shsmu.edu.cn/english/info/1305/2376.htm" }
  ],

  links: [
    { name: "Manuscript (Nature Sustainability, in peer review)", url: "/publications" }
  ],

  captions: [
    "Continuous-flow chip reactor in operation",
    "100-day perpetual mRNA synthesis with steady-state output"
  ]
}
```

## Image Assets

Two cropped panels from the manuscript, with strict no-modification rule:

- `public/E1.jpg`: cropped from Manuscript Fig 1d (full continuous-flow chip
  reactor setup with syringe pumps, reactor body, collection tubes). Crop only;
  do not adjust color, contrast, scaling proportions, or overlay annotations.
- `public/E2.jpg`: cropped from Manuscript Fig 3v (100-day cumulative yield curve
  with embedded gel electrophoresis inset). Crop only.

After cropping, mandatory visual check: open both files alongside the original
manuscript page and visually confirm no truncation of axis labels, no color
shift, no proportional distortion, no unintended overlay.

## Code Changes Required

### 1. `src/pages/research.astro`

- Insert the project object above between the `hydrogels` and `extraction`
  entries in the `projects` array (currently lines 39-90 are hydrogels →
  extraction; chip-reactor goes between them).
- Extend the hardcoded image-filename ternary at line 225 and 241 to handle the
  new `chip-reactor` id, mapping to `E1` and `E2`. The current chain reads
  `project.id === 'tracers' ? 'A1' : project.id === 'hydrogels' ? 'B1' : project.id === 'extraction' ? 'C1' : 'D1'`
  and must become
  `project.id === 'tracers' ? 'A1' : project.id === 'hydrogels' ? 'B1' : project.id === 'chip-reactor' ? 'E1' : project.id === 'extraction' ? 'C1' : 'D1'`.
  Apply identically to both lines (E1 on line 225, E2 on line 241).
- Optionally clean up the now-stale "Another manuscript in preparation" line in
  the hydrogels project's `outcomes` array (line 52) and the trailing sentence
  about a manuscript-in-preparation in `nextSteps` (line 48). The chip-reactor
  is the manuscript previously referenced; with chip-reactor now its own
  project, the hydrogels references should either be removed or replaced with
  a more specific pointer (e.g., "See Chip reactor project for the
  Nature Sustainability work").
- Update the collaborator-link rendering at line 279 to handle empty URL safely:
  ```astro
  {collab.url ? (
    <a href={collab.url} target="_blank" rel="noopener noreferrer" class="link link-primary text-xs md:text-sm hover:underline">
      {collab.name}
    </a>
  ) : (
    <span class="text-xs md:text-sm">{collab.name}</span>
  )}
  ```
  This protects Fengqin Li's empty-URL case and any future collaborator without
  a stable institutional URL.

### 2. `src/pages/research.astro` hero metrics

The current header reads `"4 Publications • 2 Patents"`. Chip reactor is "in peer
review" rather than "published", so do not bump the publication count. Leave
hero metrics unchanged.

### 3. `public/E1.jpg`, `public/E2.jpg`

Crop from `/Users/lizy0314/Desktop/B Exam/Paper 3/Manuscript.pdf` Fig 1d and Fig
3v respectively, per the no-modification rule above.

## Validation

After implementation:

1. Run `npm run dev` and visually load `http://localhost:4321/research`
2. Confirm chip-reactor section appears between hydrogels and extraction
3. Confirm top-nav shortLabel "Chip reactor" appears as an anchor tab
4. Confirm both images render without distortion
5. Confirm Fengqin Li renders as plain text (no broken link)
6. Confirm Peifeng Liu link opens his SJTU profile in a new tab
7. Confirm "Click for Full Details" expand reveals the full problem/approach/
   results/impact/nextSteps fields
8. Confirm hero metrics still read "4 Publications • 2 Patents"
9. Confirm dark blue click bug from earlier session is still fixed for menu
   links and the new chip-reactor anchor tab

## Out of Scope

- Updating CV.ts publications list (already handled in earlier session)
- Updating jsonld.ts (already handled)
- Updating publications.astro (already handled)
- Adding new research projects beyond chip-reactor

## Open Items the User Owns

- Confirm Fengqin Li URL truly should remain blank (was confirmed in this
  session)
- Provide or generate `public/E1.jpg` and `public/E2.jpg` (Manuscript.pdf Fig 1d
  and Fig 3v, crop only). User has indicated I should crop these.
