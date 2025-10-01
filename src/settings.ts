export const profile = {
	fullName: 'Zeyu (Alban) Li',
	title: 'PhD Candidate in Biological and Environmental Engineering',
	institute: 'Cornell University',
	author_name: 'Zeyu Li', // Author name to be highlighted in the papers section
	research_areas: [
		// { title: 'Physics', description: 'Brief description of the research interest', field: 'physics' },
	],
}

// Set equal to an empty string to hide the icon that you don't want to display
export const social = {
	email: 'zl788@cornell.edu',
	linkedin: 'www.linkedin.com/in/albanli',
	x: '',
	github: 'https://github.com/AlbanLi0314',
	gitlab: '',
	scholar: 'https://scholar.google.com/citations?user=WjsQd98AAAAJ&hl=en',
	inspire: '',
	arxiv: '',
	orcid: 'https://orcid.org/0000-0001-6980-8938',
}

export const template = {
	website_url: 'https://zeyuli.net', // Astro needs to know your site’s deployed URL to generate a sitemap. It must start with http:// or https://
	menu_left: false,
	transitions: true,
	lightTheme: 'light', // Select one of the Daisy UI Themes or create your own
	darkTheme: 'dark', // Select one of the Daisy UI Themes or create your own
	excerptLength: 200,
	postPerPage: 5,
    base: '' // Repository name starting with /
}

export const seo = {
	default_title: 'Astro Academia',
	default_description: 'Astro Academia is a template for academic websites.',
	default_image: '/images/astro-academia.png',
}
