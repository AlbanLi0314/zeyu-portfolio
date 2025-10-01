# zeyu-portfolio

Personal research portfolio (materials + biotech) built with Astro Academia. Light theme, fast static deploys via GitHub Pages. Sections: Home, Projects, Publications, Teaching, Talks, Writing, CV.

## 🚀 Project Structure

```
/
├── public/
│   ├── favicon.svg
│   └── projects/
│       └── project-placeholder.jpg
├── src/
│   ├── components/
│   │   └── Card.astro          # Reusable project card component
│   ├── layouts/
│   │   └── BaseLayout.astro    # Main layout with nav and footer
│   ├── pages/
│   │   ├── index.astro         # Home page
│   │   ├── projects.astro      # Projects showcase
│   │   ├── publications.astro  # Academic publications
│   │   ├── teaching.astro      # Teaching experience
│   │   ├── talks.astro         # Presentations and talks
│   │   ├── writing.astro       # Blog posts and articles
│   │   ├── cv.astro            # Curriculum Vitae
│   │   └── contact.astro       # Contact information and form
│   └── styles/
│       └── global.css          # Global styles with light-only palette
├── astro.config.mjs            # Astro configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

## 🎨 Features

- **Light-only theme**: Clean, professional color palette optimized for academic portfolios
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessible**: Focus states, skip links, semantic HTML, and ARIA labels
- **Fast**: Static site generation for optimal performance
- **SEO-friendly**: Proper meta tags and semantic structure

## 📝 Customization

### Update Personal Information

1. Edit social links in `src/layouts/BaseLayout.astro` (footer section)
2. Update content in each page file in `src/pages/`
3. Replace placeholder images in `public/projects/`

### Modify Colors

Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --color-primary: #2563eb;        /* Primary blue */
  --color-background: #ffffff;      /* Background white */
  --color-text: #1a202c;           /* Text dark gray */
  /* ... more colors ... */
}
```

### Add New Projects

Use the `<Card>` component in `projects.astro`:

```astro
<Card 
  title="Project Name"
  bullets={[
    "Key feature or achievement",
    "Another important detail",
    "Third highlight"
  ]}
  imageUrl={`${base}projects/your-image.jpg`}
  imageAlt="Descriptive alt text"
/>
```

## 🚢 Deployment

The site is configured to deploy to GitHub Pages automatically when you push to the `main` branch.

### Setup GitHub Pages

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to main branch to trigger deployment

The site will be available at: `https://albanli0314.github.io/zeyu-portfolio/`

## 📦 Built With

- [Astro](https://astro.build/) - Static site generator
- Pure CSS - No framework needed for the light theme

## 📄 License

ISC
