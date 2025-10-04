export const profile = {
	fullName: 'Zeyu (Alban) Li',
	title: 'PhD Candidate in Biological and Environmental Engineering',
	institute: 'Cornell University',
	author_name: 'Zeyu Li',
	research_areas: [
		{ 
			title: 'DNA-Based Materials Engineering', 
			description: 'Developing programmable DNA-polymer nanoparticles and hydrogels for environmental monitoring and self-healing structural applications', 
			field: 'biology'
		},
		{ 
			title: 'Environmental Sensing & Monitoring', 
			description: 'Creating synthetic eDNA tracers for large-scale hydrological studies and ecological transport modeling', 
			field: 'biology'
		},
		{ 
			title: 'Advanced Manufacturing', 
			description: 'Leveraging 3D printing, electrospray, and nanofabrication for stimulus-responsive and self-repairing materials', 
			field: 'computer-science'
		},
	],
}

export const NAV_LINKS = [
	{ title: 'Home', href: '/' },
	{ title: 'Research', href: '/research' },
	{ title: 'Publications', href: '/publications' },
	{ title: 'Teaching & Coursework', href: '/teaching' },
	{ title: 'Skills', href: '/skills' },
	{ title: 'Series', href: '/series' },
	{ title: 'CV', href: '/cv' },
	{ title: 'Contact', href: '/contact' },
]

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
	website_url: 'https://zeyuli.net',
	menu_left: false,
	transitions: true,
	lightTheme: 'professional',
	darkTheme: 'professional-dark',
	excerptLength: 200,
	postPerPage: 5,
	base: ''
}

export const seo = {
	default_title: 'Zeyu (Alban) Li - PhD Candidate',
	default_description: 'Personal academic website of Zeyu (Alban) Li, PhD Candidate in Biological and Environmental Engineering at Cornell University.',
	default_image: '/images/astro-academia.png',
}
