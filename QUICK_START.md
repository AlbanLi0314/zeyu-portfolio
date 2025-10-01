# Quick Start Guide

## Adding Your Content

### 1. Add Research Papers
Create a new `.md` file in `src/content/papers/`:

```markdown
---
title: "Your Paper Title"
authors: ["Zeyu Li", "Co-Author Name"]
venue: "Conference or Journal Name"
year: 2024
doi: "10.xxxx/xxxxx"
pdf: "/papers/your-paper.pdf"
keywords: ["keyword1", "keyword2", "keyword3"]
featured: true
---

# Abstract
Your abstract here...
```

### 2. Add Patents
Create a new `.md` file in `src/content/patents/`:

```markdown
---
title: "Patent Title"
inventors: ["Zeyu Li", "Co-Inventor"]
number: "US1234567890"
status: "granted"  # or "pending"
year: 2024
link: "https://patents.google.com/patent/..."
summary: "Brief patent description"
---

Patent details here...
```

### 3. Add Teaching Experience
Create a new `.md` file in `src/content/teaching/`:

```markdown
---
role: "Teaching Assistant"
course: "Course Name"
term: "Fall 2024"
institution: "Cornell University"
link: "https://course-website.com"
notes: "Brief description of responsibilities"
---

Detailed teaching experience...
```

### 4. Write Series Posts
Create a new `.md` file in `src/content/series/` with format `YYYY-MM-DD-slug.md`:

```markdown
---
title: "Post Title"
date: "2025-10-01"
tags: ["tutorial", "research"]
summary: "Brief summary"
draft: false
---

# Your Content

Write your series post content here using Markdown...
```

### 5. Update Your Profile
Edit `src/settings.ts`:

```typescript
export const profile = {
	fullName: 'Zeyu (Alban) Li',
	title: 'PhD Candidate in Biological and Environmental Engineering',
	institute: 'Cornell University',
	author_name: 'Zeyu Li',
	research_areas: [
		{ 
			title: 'Your Research Area', 
			description: 'Description of this research focus', 
			field: 'biology'  // Available: physics, biology, chemistry, computer-science, mathematics
		},
		// Add more research areas...
	],
}
```

### 6. Fill in CV Data
Edit `src/data/cv.ts`:

```typescript
export const education = [
	{
		school: 'Cornell University',
		time: '2020 - Present',
		degree: 'PhD in Biological and Environmental Engineering',
		location: 'Ithaca, NY',
		description: 'Research focus: ...',
	},
	// Add more education...
]

export const experiences = [
	{
		company: 'Company/Institution Name',
		time: '2022 - Present',
		title: 'Position Title',
		location: 'Location',
		description: 'What you did...',
	},
	// Add more experiences...
]

export const skills = [
	{
		title: 'Category Name',
		description: 'Skill 1, Skill 2, Skill 3',
	},
	// Add more skills...
]

export const publications = [
	{
		title: 'Publication Title',
		authors: 'Author list',
		journal: 'Journal/Conference Name',
		time: '2024',
		link: 'https://...',
		abstract: 'Brief abstract',
	},
	// Add more publications...
]
```

## Running the Site

### Development Mode
```bash
npm run dev
```
Visit http://localhost:4321

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Quick Customization Tips

### Change Theme Colors
The site uses DaisyUI themes. Edit `src/settings.ts`:
```typescript
export const template = {
	lightTheme: 'light',  // Options: light, cupcake, bumblebee, emerald, corporate, etc.
	darkTheme: 'dark',    // Options: dark, synthwave, halloween, forest, black, etc.
	// ...
}
```

### Update Social Links
Edit `src/settings.ts`:
```typescript
export const social = {
	email: 'your.email@cornell.edu',
	linkedin: 'linkedin.com/in/yourprofile',
	github: 'https://github.com/yourusername',
	scholar: 'https://scholar.google.com/citations?user=...',
	orcid: 'https://orcid.org/xxxx-xxxx-xxxx-xxxx',
}
```

### Add CV PDF for Download
1. Place your CV PDF in `/public/cv.pdf`
2. The download button on `/cv` page will automatically work

## File Naming Conventions

- **Papers**: `descriptive-name.md` (e.g., `machine-learning-2024.md`)
- **Patents**: `descriptive-name.md` (e.g., `water-treatment-system.md`)
- **Teaching**: `course-code-term.md` (e.g., `bee-4750-fall-2024.md`)
- **Series**: `YYYY-MM-DD-title-slug.md` (e.g., `2025-10-01-getting-started.md`)

## Common Tasks

### Remove the Blog Section (Already Done)
The blog has been removed from navigation but files remain. To fully remove:
```bash
rm -rf src/pages/blog
rm -rf src/content/BlogPosts
```

### Add a New Navigation Link
Edit `src/settings.ts` and add to `NAV_LINKS` array:
```typescript
{ title: 'New Page', href: '/new-page' }
```

Then create the page at `src/pages/new-page.astro`

### Customize Homepage
Edit `src/pages/index.astro` to update:
- Bio text
- CTA button links
- About section content

## Need Help?
- Astro docs: https://docs.astro.build
- DaisyUI components: https://daisyui.com/components
- Your current site runs on Astro 5.13.5 with React, Tailwind CSS, and DaisyUI
