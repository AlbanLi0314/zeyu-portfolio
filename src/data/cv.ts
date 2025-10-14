export const experiences = [
	{
		company: 'Cornell University',
		time: 'Feb 2021 - Present',
		title: 'Graduate Research Assistant',
		location: 'Ithaca, NY',
		description: 'DNA Materials Lab. DNA-polymer nanoparticle tracers: fabricated via emulsion and electrospray; field-deployed across an 11 km² sector of Cayuga Lake; coordinated four disciplines; achieved qPCR detection 7 km from release with ~1 mg DNA; generated datasets now used to calibrate 3D hydrodynamic eDNA-transport models (first author, ES&T under review, 2025). Self-healing DNA hydrogels for ceramic composite repair: DNA–Al³⁺ hydrogels integrated into CAD-designed, 3D-printed vascular tiles; multi-cycle healing validated by tensile testing and EDS mapping (ACADIA 2024). Photo/thermo-reversible psoralen-clamped DNA hydrogels enabling 3D-printable, time-programmed shape fixing and repeated repair. Automated high-throughput DNA-purification platform: perfluorocarbon pod system delivering ~200 mg per pod (chainable to gram scale) and ~91% cost reduction. Advanced characterization: tensile & rheology; SEM/DLS; UV-Vis/fluorescence; contact angle; EDS mapping. Leadership: mentored 3 undergrads; coordinated field team; presented at ACADIA 2024, ACS Fall 2023, Belt-and-Road Youth Forum 2023.',
	},
	{
		company: 'Cornell University',
		time: 'Feb 2021 - Present',
		title: 'Graduate Teaching Assistant',
		location: 'Ithaca, NY',
		description: 'Dept. of Biological & Environmental Engineering. Supported courses in bio-design, molecular & cellular engineering, watershed systems, engineering professionalism, and sustainable development. Delivered guest lectures; integrated AI tools into assignments, review sessions, and data analysis workflows.',
	},
	{
		company: 'Hong Kong Baptist University',
		time: 'Jun 2017 - Aug 2019 & Oct 2020 - Jan 2021',
		title: 'Undergraduate Research Assistant & Senior Research Assistant',
		location: 'Kowloon, Hong Kong',
		description: 'Superhydrophobic fluoropolymer surfaces: nanopatterned Teflon films via photolithography/two-photon lithography/etching; ultra-low wettability and durability; contributed to a U.S. patent on hierarchical architectures. Built an automated environmental-simulation chamber for wetting and coating-durability testing. Led a charge-mediated anti-icing study (top-rated undergraduate thesis).',
	},
	{
		company: 'Georgia State University',
		time: 'Jun 2018 - Aug 2018',
		title: 'Research Exchange Program',
		location: 'Atlanta, GA',
		description: 'Quantified PU.1 transcription-factor binding to DNA via LSPR.',
	},
];

export const education = [
	{
		school: 'Cornell University',
		time: '2020 - Present',
		degree: 'Ph.D., Biological & Environmental Engineering (Expected May 2026)',
		location: 'Ithaca, NY',
		description: 'DNA Materials Lab, Advisor: Dan Luo',
	},
	{
		school: 'Cornell University',
		time: 'Aug 2024',
		degree: 'M.S., Biological & Environmental Engineering',
		location: 'Ithaca, NY',
		description: '',
	},
	{
		school: 'Cornell University',
		time: 'May 2020',
		degree: 'M.Eng., Biological & Environmental Engineering',
		location: 'Ithaca, NY',
		description: '',
	},
	{
		school: 'Hong Kong Baptist University',
		time: 'Sep 2015 - Jun 2019',
		degree: 'B.Sc. (Hons.) Chemistry (Major), Computer Science (Minor)',
		location: 'Kowloon, Hong Kong',
		description: 'Microfabrication & Surface Materials Lab, Supervisor: Kangning Ren',
	},
];

export const skills = [
	{
		title: 'Materials Characterization',
		description: 'SEM, DLS, EDS, UV-Vis Spectroscopy, Fluorometry, Rheometry, Electrophoresis, Tensile Testing, Contact Angle Measurement',
	},
	{
		title: 'Fabrication & Processing',
		description: 'Electrospray, DIW 3D Printing, SLA/FDM Printing (Polymers & Ceramics), Spin Coating, Mold Casting, Solvent Precipitation, Photolithography, Two-Photon Lithography, Nanopatterning',
	},
	{
		title: 'Molecular & Bioengineering',
		description: 'PCR, qPCR, IVT, Electrophoresis (PAGE, Agarose), DNA/RNA Extraction & Purification, Chromatography, Enzyme Recycling, LSPR Assays, Bio-cleanroom Protocols',
	},
	{
		title: 'Programming & Computational',
		description: 'Python, Java, Machine Learning (TensorFlow, PyTorch), Data Analysis (Pandas, NumPy, Seaborn)',
	},
	{
		title: 'Design & Visualization',
		description: 'CAD, SketchUp, 3ds Max, Adobe Creative Suite (Illustrator, Photoshop, InDesign), Bootstrap Studio, Scientific Figures, Video/Audio Editing',
	},
	{
		title: 'Languages',
		description: 'English (Fluent), Mandarin (Native), Cantonese (Proficient)',
	},
];

export const publications = [
	{
		title: 'Tracing Environmental DNA Transport in Large Lakes with Synthetic DNA Microparticles and Hydrodynamic Modeling',
		authors: 'Li, Z., Ramón, C. L., Koeberle, A., et al.',
		journal: 'Environmental Science & Technology (under review)',
		time: '2025',
		link: '',
		abstract: '',
	},
	{
		title: 'PolyTile 4.0: Self-healing Ceramic Tiles',
		authors: 'He, C., Li, Z., Wang, L. X., et al.',
		journal: 'ACADIA',
		time: '2024',
		link: '',
		abstract: '',
	},
	{
		title: 'All-perfluoropolymer, nonlinear stability-assisted monolithic surface combines topology-specific superwettability with ultradurability',
		authors: 'Li, W., Chan, C. W., Li, Z., et al.',
		journal: 'The Innovation',
		time: '2023',
		link: '',
		abstract: '',
	},
];

export const patents = [
	{
		title: 'Crack engineering as a new route for the construction of arbitrary hierarchical architectures',
		inventors: 'Ren, K., Wu, H., Wang, Z., Yao, S., Ong, B., Li, W., Li, Z., Sun, H., Chan, C.W.',
		number: 'US 11,839,998',
		time: '2023',
		status: 'Granted',
		link: '',
		abstract: '',
	},
	{
		title: 'Reactor and method of spiral propulsion biomass continuous thermal cracking',
		inventors: 'Li, Q., Li, Z., & Lin, Z.',
		number: 'CN 201711214139.6',
		time: '2017',
		status: 'Granted',
		link: '',
		abstract: '',
	},
];

export const conferences = [
	{
		title: 'DNA Nano Tracer for Hydrological and Environmental Investigations',
		type: 'Oral' as const,
		venue: 'International Forum for Green Low Carbon Innovation and Development',
		location: 'Anji, China',
		time: '2023',
	},
	{
		title: 'DNA-PLGA Nanosphere Tracers: A reliable Tool for Studying Environmental DNA (eDNA) Transport in Aquatic Ecosystems',
		type: 'Poster' as const,
		venue: 'ACS Fall 2023 National Meeting',
		location: 'San Francisco, CA',
		time: '2023',
	},
];
