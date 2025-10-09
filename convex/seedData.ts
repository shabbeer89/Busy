// South Indian specific sample data for business matchmaking platform
// Targeting every detail as South India with 10 records per category

export const southIndianNames = {
  firstNames: [
    "Arjun", "Karthik", "Vignesh", "Suresh", "Ravi", "Prakash", "Mohan", "Senthil", "Gopal", "Kumar",
    "Priya", "Lakshmi", "Kavitha", "Deepa", "Meera", "Anitha", "Shilpa", "Radha", "Uma", "Divya",
    "Balaji", "Chandran", "Dinesh", "Elango", "Ganesh", "Hari", "Ibrahim", "Jagan", "Kannan", "Lakshmanan"
  ],
  lastNames: [
    "Iyer", "Iyengar", "Nair", "Menon", "Pillai", "Reddy", "Naidu", "Raju", "Kumar", "Swamy",
    "Krishnan", "Raman", "Subramanian", "Venkatesan", "Ganesan", "Srinivasan", "Rajagopal", "Balasubramanian", "Chandrasekhar", "Dhanapal"
  ]
};

export const southIndianCompanies = [
  "Chennai Tech Solutions", "Bangalore AgriTech", "Hyderabad FinTech", "Kerala Health Systems", "Coimbatore Manufacturing",
  "Madurai Mobile Apps", "Trivandrum Software", "Kochi Digital Services", "Pondicherry Analytics", "Tiruchirappalli Robotics",
  "Kanyakumari Fisheries", "Vellore Medical Devices", "Salem Textile Tech", "Erode Energy Solutions", "Thanjavur Food Processing",
  "Kozhikode Spice Tech", "Thrissur Education Systems", "Kollam Marine Tech", "Alappuzha Coconut Processing", "Idukki Tea Technology"
];

export const southIndianCities = [
  "Chennai", "Bangalore", "Hyderabad", "Kochi", "Coimbatore", "Madurai", "Trivandrum", "Mysore", "Vijayawada", "Visakhapatnam",
  "Pondicherry", "Tiruchirappalli", "Salem", "Vellore", "Kanyakumari", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Idukki"
];

export const southIndianIndustries = [
  "Information Technology", "Biotechnology", "Healthcare", "Agriculture", "Textile Manufacturing", "Food Processing",
  "Automotive Components", "Electronics", "Renewable Energy", "Tourism & Hospitality", "Fisheries & Aquaculture",
  "Spice Processing", "Coconut Products", "Tea & Coffee", "Traditional Medicine", "Handicrafts", "Software Services",
  "Medical Tourism", "Port & Logistics", "Education Technology"
];

export const southIndianBusinessCategories = [
  "Technology", "Healthcare", "Agriculture", "Food & Beverage", "Manufacturing", "Education",
  "Energy", "Tourism", "Textiles", "Fisheries", "Spices", "Traditional Medicine", "Handicrafts",
  "Software", "Medical Devices", "Automotive", "Electronics", "Logistics", "Education", "Hospitality"
];

// 20 South Indian Investors (Expanded for better industry coverage)
export const southIndianInvestors = [
  {
    email: "arjun.iyer@email.com",
    name: "Arjun Iyer",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Chennai Capital Partners",
    industry: "Information Technology",
    experience: "15 years in tech investments",
    investmentRange: { min: 500000, max: 5000000 },
    preferredIndustries: ["Technology", "Healthcare", "Biotechnology"],
    riskTolerance: "medium" as const,
    bio: "Chennai-based tech investor focusing on South Indian startups with global potential",
    location: "Chennai, Tamil Nadu",
    website: "https://chennaicapital.com",
    socialLinks: { linkedin: "https://linkedin.com/in/arjuniyer", twitter: "https://twitter.com/arjuniyer" }
  },
  {
    email: "lakshmi.nair@email.com",
    name: "Lakshmi Nair",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Kerala Investment Group",
    industry: "Healthcare",
    experience: "12 years in healthcare investments",
    investmentRange: { min: 300000, max: 3000000 },
    preferredIndustries: ["Healthcare", "Medical Tourism", "Traditional Medicine"],
    riskTolerance: "low" as const,
    bio: "Kochi-based investor specializing in healthcare innovations and medical tourism",
    location: "Kochi, Kerala",
    website: "https://keralainvestments.com"
  },
  {
    email: "karthik.reddy@email.com",
    name: "Karthik Reddy",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Hyderabad Ventures",
    industry: "Biotechnology",
    experience: "18 years in biotech investments",
    investmentRange: { min: 800000, max: 8000000 },
    preferredIndustries: ["Biotechnology", "Healthcare", "Agriculture"],
    riskTolerance: "high" as const,
    bio: "Hyderabad-based biotech investor supporting innovation in life sciences",
    location: "Hyderabad, Telangana",
    website: "https://hyderabadventures.com"
  },
  {
    email: "priya.menon@email.com",
    name: "Priya Menon",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Cochin Family Office",
    industry: "Tourism & Hospitality",
    experience: "10 years in hospitality",
    investmentRange: { min: 400000, max: 4000000 },
    preferredIndustries: ["Tourism", "Hospitality", "Food & Beverage"],
    riskTolerance: "medium" as const,
    bio: "Kerala-based investor focusing on tourism and hospitality ventures",
    location: "Kochi, Kerala",
    website: "https://cochinfamilyoffice.com"
  },
  {
    email: "suresh.pillai@email.com",
    name: "Suresh Pillai",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Trivandrum Capital",
    industry: "Agriculture",
    experience: "14 years in agribusiness",
    investmentRange: { min: 200000, max: 2000000 },
    preferredIndustries: ["Agriculture", "Food Processing", "Fisheries"],
    riskTolerance: "low" as const,
    bio: "Kerala-based agri-investor supporting sustainable farming and fisheries",
    location: "Trivandrum, Kerala",
    website: "https://trivandrumcapital.com"
  },
  {
    email: "kavitha.krishnan@email.com",
    name: "Kavitha Krishnan",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Bangalore Investment Partners",
    industry: "Education Technology",
    experience: "11 years in education",
    investmentRange: { min: 350000, max: 3500000 },
    preferredIndustries: ["Education", "Technology", "Software"],
    riskTolerance: "medium" as const,
    bio: "Bangalore-based edtech investor focusing on innovative learning solutions",
    location: "Bangalore, Karnataka",
    website: "https://bangaloreinvestments.com"
  },
  {
    email: "ravi.subramanian@email.com",
    name: "Ravi Subramanian",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Coimbatore Manufacturing Fund",
    industry: "Manufacturing",
    experience: "16 years in manufacturing",
    investmentRange: { min: 600000, max: 6000000 },
    preferredIndustries: ["Manufacturing", "Automotive", "Textiles"],
    riskTolerance: "high" as const,
    bio: "Coimbatore-based investor supporting traditional and modern manufacturing",
    location: "Coimbatore, Tamil Nadu",
    website: "https://coimbatorefund.com"
  },
  {
    email: "deepa.venkatesan@email.com",
    name: "Deepa Venkatesan",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Madurai Growth Partners",
    industry: "Textile Manufacturing",
    experience: "13 years in textiles",
    investmentRange: { min: 250000, max: 2500000 },
    preferredIndustries: ["Textiles", "Handicrafts", "Manufacturing"],
    riskTolerance: "medium" as const,
    bio: "Madurai-based investor specializing in textile and handicraft businesses",
    location: "Madurai, Tamil Nadu",
    website: "https://maduraigrowth.com"
  },
  {
    email: "mohan.ganesan@email.com",
    name: "Mohan Ganesan",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Pondicherry Innovation Fund",
    industry: "Renewable Energy",
    experience: "9 years in clean energy",
    investmentRange: { min: 450000, max: 4500000 },
    preferredIndustries: ["Energy", "Sustainability", "Technology"],
    riskTolerance: "medium" as const,
    bio: "Pondicherry-based investor focusing on renewable energy solutions",
    location: "Pondicherry, Tamil Nadu",
    website: "https://pondicherryfund.com"
  },
  {
    email: "anitha.balasubramanian@email.com",
    name: "Anitha Balasubramanian",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Tiruchirappalli Tech Fund",
    industry: "Electronics",
    experience: "8 years in electronics",
    investmentRange: { min: 300000, max: 3000000 },
    preferredIndustries: ["Electronics", "Technology", "Manufacturing"],
    riskTolerance: "medium" as const,
    bio: "Tiruchirappalli-based investor supporting electronics and tech manufacturing",
    location: "Tiruchirappalli, Tamil Nadu",
    website: "https://tiruchirappallifund.com"
  },
  {
    email: "senthil.kumar@email.com",
    name: "Senthil Kumar",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Thiruvananthapuram Fishery Ventures",
    industry: "Fisheries & Aquaculture",
    experience: "13 years in fisheries investments",
    investmentRange: { min: 150000, max: 1500000 },
    preferredIndustries: ["Fisheries", "Aquaculture", "Food Processing"],
    riskTolerance: "low" as const,
    bio: "Kerala's leading investor in sustainable fisheries and aquaculture ventures",
    location: "Thiruvananthapuram, Kerala",
    website: "https://trivandrumventures.com"
  },
  {
    email: "gowri.sundaram@email.com",
    name: "Gowri Sundaram",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Salem Spice & Tea Capital",
    industry: "Food Processing",
    experience: "11 years in spice industry",
    investmentRange: { min: 250000, max: 2000000 },
    preferredIndustries: ["Spice Processing", "Tea", "Food Processing"],
    riskTolerance: "medium" as const,
    bio: "Salem-based investor passionate about traditional Indian spice and tea value chains",
    location: "Salem, Tamil Nadu",
    website: "https://salemspice.com"
  },
  {
    email: "vijay.rajesh@email.com",
    name: "Vijay Rajesh",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Chengalpattu Handicrafts Fund",
    industry: "Handicrafts",
    experience: "9 years in cultural industries",
    investmentRange: { min: 100000, max: 800000 },
    preferredIndustries: ["Handicrafts", "Traditional Arts", "Cultural Preservation"],
    riskTolerance: "medium" as const,
    bio: "Supporting traditional artisans and handicraft entrepreneurs in Tamil Nadu",
    location: "Chengalpattu, Tamil Nadu",
    website: "https://chengalpattafund.com"
  },
  {
    email: "malar.v.samples@email.com",
    name: "Malar V. Samples",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Vellore Medical Tourism Partners",
    industry: "Medical Tourism",
    experience: "14 years in healthcare",
    investmentRange: { min: 400000, max: 3500000 },
    preferredIndustries: ["Medical Tourism", "Healthcare", "Hospitality"],
    riskTolerance: "medium" as const,
    bio: "Vellore-based investor creating partnerships for international medical tourism",
    location: "Vellore, Tamil Nadu",
    website: "https://vellorepartners.com"
  },
  {
    email: "ganesh.ramanna@email.com",
    name: "Ganesh Ramanna",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Mysore Traditional Medicine Fund",
    industry: "Traditional Medicine",
    experience: "12 years in Ayurveda and Siddha",
    investmentRange: { min: 200000, max: 1800000 },
    preferredIndustries: ["Traditional Medicine", "Healthcare", "Pharmaceuticals"],
    riskTolerance: "low" as const,
    bio: "Mysore-based investor preserving and commercializing Karnataka's traditional medicine practices",
    location: "Mysore, Karnataka",
    website: "https://mysoremedicine.com"
  },
  {
    email: "shakti.sharma@email.com",
    name: "Shakti Sharma",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Vijayawada Software Ventures",
    industry: "Software Services",
    experience: "10 years in IT services",
    investmentRange: { min: 300000, max: 2500000 },
    preferredIndustries: ["Software", "IT Services", "Technology"],
    riskTolerance: "medium" as const,
    bio: "Andhra Pradesh-based investor supporting software services innovation",
    location: "Vijayawada, Andhra Pradesh",
    website: "https://vijayawadavc.com"
  },
  {
    email: "harish.gowda@email.com",
    name: "Harish Gowda",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Davangere Agri-Input Fund",
    industry: "Agricultural Inputs",
    experience: "15 years in agricultural supplies",
    investmentRange: { min: 200000, max: 2000000 },
    preferredIndustries: ["Agriculture", "Fertilizers", "Seed Technology"],
    riskTolerance: "low" as const,
    bio: "Davangere-based investor in agricultural inputs and farm machinery for Karnataka farmers",
    location: "Davangere, Karnataka",
    website: "https://davangerefund.com"
  },
  {
    email: "nandini.rao@email.com",
    name: "Nandini Rao",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Mangalore Logistics Partners",
    industry: "Logistics",
    experience: "13 years in shipping and logistics",
    investmentRange: { min: 500000, max: 4000000 },
    preferredIndustries: ["Logistics", "Port Services", "Supply Chain"],
    riskTolerance: "high" as const,
    bio: "Mangalore-based investor streamlining logistics for Karnataka's export-import businesses",
    location: "Mangalore, Karnataka",
    website: "https://mangalorelogistics.com"
  },
  {
    email: "prakash.mehta@email.com",
    name: "Prakash Mehta",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Tirupati Tourism Fund",
    industry: "Tourism",
    experience: "16 years in tourism development",
    investmentRange: { min: 300000, max: 3000000 },
    preferredIndustries: ["Tourism", "Pilgrimage", "Cultural Tourism"],
    riskTolerance: "medium" as const,
    bio: "Tirupati-based investor developing sustainable tourism infrastructure across South India",
    location: "Tirupati, Andhra Pradesh",
    website: "https://tirupatitourism.com"
  },
  {
    email: "saritha.chandra@email.com",
    name: "Saritha Chandra",
    userType: "investor" as const,
    isVerified: true,
    companyName: "Tirunelveli Coconut Fund",
    industry: "Coconut Products",
    experience: "14 years in coconut processing",
    investmentRange: { min: 250000, max: 2500000 },
    preferredIndustries: ["Coconut Processing", "Agriculture", "Food Processing"],
    riskTolerance: "low" as const,
    bio: "Tirunelveli-based investor supporting coconut farmers and processing technology innovation",
    location: "Tirunelveli, Tamil Nadu",
    website: "https://tirunelvelicoconut.com"
  }
];

// 10 South Indian Creators
export const southIndianCreators = [
  {
    email: "vignesh.kumar@email.com",
    name: "Vignesh Kumar",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Chennai AgriTech Solutions",
    industry: "Agriculture",
    experience: "6 years in agricultural technology",
    bio: "Chennai-based agri-tech entrepreneur developing IoT solutions for Tamil Nadu farmers",
    location: "Chennai, Tamil Nadu"
  },
  {
    email: "meera.srinivasan@email.com",
    name: "Meera Srinivasan",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Bangalore HealthTech",
    industry: "Healthcare",
    experience: "7 years in healthcare IT",
    bio: "Bangalore-based healthcare innovator creating telemedicine solutions for Karnataka",
    location: "Bangalore, Karnataka"
  },
  {
    email: "prakas.rajagopal@email.com",
    name: "Prakash Rajagopal",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Hyderabad BioTech Labs",
    industry: "Biotechnology",
    experience: "8 years in biotech research",
    bio: "Hyderabad-based biotech researcher developing affordable medical solutions",
    location: "Hyderabad, Telangana"
  },
  {
    email: "shilpa.chandrasekhar@email.com",
    name: "Shilpa Chandrasekhar",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Kerala Spice Technologies",
    industry: "Food Processing",
    experience: "5 years in food technology",
    bio: "Kerala-based food technologist modernizing spice processing in Kozhikode",
    location: "Kozhikode, Kerala"
  },
  {
    email: "radha.dhanapal@email.com",
    name: "Radha Dhanapal",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Coimbatore Textile Innovation",
    industry: "Textile Manufacturing",
    experience: "4 years in textile design",
    bio: "Coimbatore-based textile designer creating sustainable fabrics",
    location: "Coimbatore, Tamil Nadu"
  },
  {
    email: "uma.gopal@email.com",
    name: "Uma Gopal",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Madurai Education Systems",
    industry: "Education Technology",
    experience: "6 years in education",
    bio: "Madurai-based edtech entrepreneur developing Tamil language learning apps",
    location: "Madurai, Tamil Nadu"
  },
  {
    email: "divya.elango@email.com",
    name: "Divya Elango",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Trivandrum Marine Technologies",
    industry: "Fisheries",
    experience: "5 years in marine biology",
    bio: "Trivandrum-based marine technologist developing sustainable fishing solutions",
    location: "Trivandrum, Kerala"
  },
  {
    email: "balaji.hari@email.com",
    name: "Balaji Hari",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Vellore Medical Devices",
    industry: "Medical Devices",
    experience: "7 years in biomedical engineering",
    bio: "Vellore-based biomedical engineer creating affordable medical devices",
    location: "Vellore, Tamil Nadu"
  },
  {
    email: "chandran.ibrahim@email.com",
    name: "Chandran Ibrahim",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Salem Energy Solutions",
    industry: "Renewable Energy",
    experience: "6 years in solar energy",
    bio: "Salem-based renewable energy entrepreneur developing solar solutions for Tamil Nadu",
    location: "Salem, Tamil Nadu"
  },
  {
    email: "dinesh.jagan@email.com",
    name: "Dinesh Jagan",
    userType: "creator" as const,
    isVerified: true,
    companyName: "Pondicherry Software Services",
    industry: "Software",
    experience: "8 years in software development",
    bio: "Pondicherry-based software developer creating business automation tools",
    location: "Pondicherry, Tamil Nadu"
  }
];

// 30 South Indian Business Ideas (expanded for better industry coverage)
export const southIndianBusinessIdeas = [
  // Agriculture (4 ideas)
  {
    title: "Coconut Processing Automation System",
    description: "Automated coconut processing plant in Kerala using AI-powered sorting and quality control. Reduces manual labor by 80% and increases processing capacity for traditional coconut farmers in Alappuzha district.",
    category: "Agriculture",
    tags: ["Coconut Processing", "Automation", "AI", "Kerala Agriculture", "Food Processing"],
    fundingGoal: 1500000,
    currentFunding: 300000,
    equityOffered: 15,
    valuation: 10000000,
    stage: "early" as const,
    timeline: "12 months to full-scale operations",
    teamSize: 8
  },
  {
    title: "Madurai Jasmine Supply Chain",
    description: "Blockchain-based supply chain for Madurai's famous jasmine flowers. Ensures fair pricing for farmers and quality assurance for the traditional jasmine garland industry.",
    category: "Agriculture",
    tags: ["Jasmine Supply Chain", "Blockchain", "Madurai", "Floriculture", "Traditional Industry"],
    fundingGoal: 450000,
    currentFunding: 75000,
    equityOffered: 11,
    valuation: 4000000,
    stage: "mvp" as const,
    timeline: "6 months to farmer network",
    teamSize: 3
  },
  {
    title: "Karnataka Organic Farming Platform",
    description: "Digital marketplace connecting Bangalore's organic farmers with consumers. Includes farm-to-table tracking and premium pricing for certified organic produce from Karnataka.",
    category: "Agriculture",
    tags: ["Organic Farming", "Marketplace", "Bangalore", "Farm-to-Table", "Sustainability"],
    fundingGoal: 1200000,
    currentFunding: 240000,
    equityOffered: 18,
    valuation: 6500000,
    stage: "early" as const,
    timeline: "10 months to Bangalore market launch",
    teamSize: 6
  },
  {
    title: "Tamil Nadu Cashew Nut Processing Tech",
    description: "Automated cashew processing facility in Kanyakumari using robotics and AI. Improves efficiency and quality for traditional cashew farmers and reduces dependency on manual processing.",
    category: "Agriculture",
    tags: ["Cashew Processing", "Robotics", "AI", "Kanyakumari", "Agricultural Tech"],
    fundingGoal: 1100000,
    currentFunding: 220000,
    equityOffered: 16,
    valuation: 6800000,
    stage: "mvp" as const,
    timeline: "8 months to pilot facility",
    teamSize: 7
  },

  // Fisheries (3 ideas)
  {
    title: "Tamil Nadu Fishery Supply Chain Platform",
    description: "Digital platform connecting Kanyakumari fishermen directly with restaurants and retailers. Uses blockchain for traceability and ensures fair pricing for traditional fishing communities.",
    category: "Fisheries",
    tags: ["Fisheries", "Supply Chain", "Blockchain", "Tamil Nadu", "Digital Platform"],
    fundingGoal: 800000,
    currentFunding: 150000,
    equityOffered: 18,
    valuation: 4500000,
    stage: "mvp" as const,
    timeline: "8 months to launch in 5 coastal districts",
    teamSize: 6
  },
  {
    title: "Kerala Marine Aquaculture Technology",
    description: "Smart aquaculture system for sustainable shrimp farming in Kerala backwaters. Uses IoT sensors for water quality monitoring and automated feeding systems.",
    category: "Fisheries",
    tags: ["Aquaculture", "IoT", "Shrimp Farming", "Kerala Backwaters", "Sustainability"],
    fundingGoal: 950000,
    currentFunding: 180000,
    equityOffered: 14,
    valuation: 6700000,
    stage: "concept" as const,
    timeline: "12 months to first commercial farm",
    teamSize: 5
  },
  {
    title: "Karnataka Seafood Export Platform",
    description: "E-commerce platform for Mangalore's seafood exporters. Connects fishermen cooperatives with international buyers and ensures quality standards for global markets.",
    category: "Fisheries",
    tags: ["Seafood Export", "E-commerce", "Mangalore", "Cooperatives", "International Trade"],
    fundingGoal: 700000,
    currentFunding: 140000,
    equityOffered: 17,
    valuation: 4100000,
    stage: "early" as const,
    timeline: "6 months to first export shipment",
    teamSize: 4
  },

  // Food Processing (3 ideas)
  {
    title: "Kerala Spice Quality Assurance System",
    description: "AI-powered quality testing and certification system for Kerala spices. Ensures authenticity and quality control for export markets while supporting traditional spice farmers in Kozhikode.",
    category: "Food Processing",
    tags: ["Spice Technology", "Quality Assurance", "AI", "Kerala Spices", "Export"],
    fundingGoal: 600000,
    currentFunding: 100000,
    equityOffered: 12,
    valuation: 5000000,
    stage: "concept" as const,
    timeline: "10 months to pilot in spice markets",
    teamSize: 4
  },
  {
    title: "Tamil Nadu Coffee Processing Innovation",
    description: "Automated coffee processing facility in Coorg using AI and robotics. Improves quality and reduces processing costs for Karnataka's premium coffee producers.",
    category: "Food Processing",
    tags: ["Coffee Processing", "Automation", "Coorg", "Quality Control", "Premium Coffee"],
    fundingGoal: 1300000,
    currentFunding: 280000,
    equityOffered: 19,
    valuation: 6800000,
    stage: "mvp" as const,
    timeline: "9 months to processing facility",
    teamSize: 8
  },
  {
    title: "Andhra Pradesh Mango Export Technology",
    description: "Cold chain and traceability system for Tirupati mango exports. Uses blockchain to ensure quality from farm to international markets.",
    category: "Food Processing",
    tags: ["Mango Export", "Cold Chain", "Tirupati", "Blockchain", "International Trade"],
    fundingGoal: 850000,
    currentFunding: 170000,
    equityOffered: 16,
    valuation: 5300000,
    stage: "early" as const,
    timeline: "8 months to export facility",
    teamSize: 6
  },

  // Healthcare (4 ideas)
  {
    title: "Bangalore Medical Tourism Platform",
    description: "Comprehensive platform connecting international patients with Karnataka's top hospitals. Integrates treatment planning, visa assistance, and local support for medical tourists in Bangalore.",
    category: "Healthcare",
    tags: ["Medical Tourism", "Healthcare Platform", "Bangalore", "International Patients", "Hospital Integration"],
    fundingGoal: 2000000,
    currentFunding: 500000,
    equityOffered: 20,
    valuation: 10000000,
    stage: "growth" as const,
    timeline: "Expanding to 10 major hospitals",
    teamSize: 12
  },
  {
    title: "Hyderabad Traditional Medicine Database",
    description: "Digital database and research platform for Telangana's traditional medicine practices. Preserves ancient knowledge while enabling modern research and commercialization opportunities.",
    category: "Healthcare",
    tags: ["Traditional Medicine", "Digital Database", "Hyderabad", "Research", "Healthcare Innovation"],
    fundingGoal: 700000,
    currentFunding: 120000,
    equityOffered: 14,
    valuation: 4800000,
    stage: "concept" as const,
    timeline: "12 months to complete database",
    teamSize: 5
  },
  {
    title: "Chennai Telemedicine Network",
    description: "Comprehensive telemedicine platform for rural Tamil Nadu. Connects patients in remote villages with specialists in Chennai through affordable smartphones and internet.",
    category: "Healthcare",
    tags: ["Telemedicine", "Rural Healthcare", "Tamil Nadu", "Digital Health", "Accessibility"],
    fundingGoal: 1800000,
    currentFunding: 360000,
    equityOffered: 18,
    valuation: 9500000,
    stage: "early" as const,
    timeline: "10 months to cover 100 villages",
    teamSize: 9
  },
  {
    title: "Kerala Ayurvedic Product Manufacturing",
    description: "Modern manufacturing facility for traditional Ayurvedic medicines in Thrissur. Combines ancient formulations with GMP standards for commercial production.",
    category: "Healthcare",
    tags: ["Ayurveda", "Traditional Medicine", "Thrissur", "GMP Standards", "Commercial Production"],
    fundingGoal: 1600000,
    currentFunding: 320000,
    equityOffered: 22,
    valuation: 7200000,
    stage: "mvp" as const,
    timeline: "14 months to production facility",
    teamSize: 11
  },

  // Textiles (2 ideas)
  {
    title: "Coimbatore Textile Waste Recycling",
    description: "Innovative textile recycling technology that converts Coimbatore's textile waste into new fibers. Supports the traditional textile industry while creating sustainable manufacturing practices.",
    category: "Textiles",
    tags: ["Textile Recycling", "Sustainability", "Coimbatore", "Manufacturing", "Circular Economy"],
    fundingGoal: 900000,
    currentFunding: 200000,
    equityOffered: 16,
    valuation: 5500000,
    stage: "mvp" as const,
    timeline: "6 months to commercial recycling plant",
    teamSize: 7
  },
  {
    title: "Karnataka Silk Production Technology",
    description: "Modern silk production facility in Mysore using automated reeling machines. Improves efficiency and quality for Karnataka's traditional silk industry.",
    category: "Textiles",
    tags: ["Silk Production", "Automation", "Mysore", "Traditional Industry", "Quality Improvement"],
    fundingGoal: 2200000,
    currentFunding: 440000,
    equityOffered: 21,
    valuation: 10400000,
    stage: "early" as const,
    timeline: "12 months to production facility",
    teamSize: 13
  },

  // Logistics & Port Services (2 ideas)
  {
    title: "Chennai Port Logistics Optimization",
    description: "AI-powered logistics platform optimizing container movement at Chennai Port. Reduces waiting times and improves efficiency for Tamil Nadu's export-import businesses.",
    category: "Logistics",
    tags: ["Port Logistics", "AI Optimization", "Chennai Port", "Supply Chain", "Export-Import"],
    fundingGoal: 2500000,
    currentFunding: 600000,
    equityOffered: 22,
    valuation: 11000000,
    stage: "early" as const,
    timeline: "9 months to port integration",
    teamSize: 10
  },
  {
    title: "Visakhapatnam Maritime Technology",
    description: "Smart port management system for Visakhapatnam Port using IoT sensors. Tracks cargo movement, predicts maintenance needs, and optimizes berthing schedules.",
    category: "Logistics",
    tags: ["Port Management", "IoT", "Visakhapatnam", "Cargo Tracking", "Predictive Maintenance"],
    fundingGoal: 2100000,
    currentFunding: 420000,
    equityOffered: 19,
    valuation: 11000000,
    stage: "concept" as const,
    timeline: "15 months to full port integration",
    teamSize: 8
  },

  // Tourism & Hospitality (3 ideas)
  {
    title: "Kerala Backwater Tourism Tech",
    description: "AR/VR platform showcasing Kerala's backwaters to international tourists. Creates virtual tours and booking systems for traditional houseboat operators in Alappuzha.",
    category: "Tourism",
    tags: ["Tourism Technology", "AR/VR", "Kerala Backwaters", "Houseboat", "Digital Tourism"],
    fundingGoal: 550000,
    currentFunding: 80000,
    equityOffered: 13,
    valuation: 4200000,
    stage: "concept" as const,
    timeline: "8 months to virtual tour launch",
    teamSize: 4
  },
  {
    title: "Tamil Nadu Temple Tourism Platform",
    description: "Digital platform for temple tourism in Tamil Nadu. Provides virtual darshan, donation systems, and package tours for domestic and international pilgrims.",
    category: "Tourism",
    tags: ["Temple Tourism", "Virtual Darshan", "Tamil Nadu", "Pilgrimage", "Digital Payments"],
    fundingGoal: 1400000,
    currentFunding: 280000,
    equityOffered: 17,
    valuation: 8200000,
    stage: "mvp" as const,
    timeline: "6 months to launch for top 10 temples",
    teamSize: 7
  },
  {
    title: "Karnataka Wildlife Tourism Network",
    description: "Integrated tourism platform for Karnataka's national parks and wildlife sanctuaries. Offers booking, guided tours, and conservation education for eco-tourists.",
    category: "Tourism",
    tags: ["Wildlife Tourism", "National Parks", "Karnataka", "Eco-Tourism", "Conservation"],
    fundingGoal: 1700000,
    currentFunding: 340000,
    equityOffered: 16,
    valuation: 10600000,
    stage: "early" as const,
    timeline: "10 months to cover 5 major parks",
    teamSize: 9
  },

  // Technology & Software (3 ideas)
  {
    title: "Hyderabad AI Research Center",
    description: "AI research and development center in Hyderabad focused on healthcare applications. Partners with local hospitals for AI-powered diagnostics and treatment planning.",
    category: "Technology",
    tags: ["AI Research", "Healthcare AI", "Hyderabad", "Diagnostics", "Treatment Planning"],
    fundingGoal: 2800000,
    currentFunding: 560000,
    equityOffered: 23,
    valuation: 12000000,
    stage: "early" as const,
    timeline: "18 months to first commercial products",
    teamSize: 16
  },
  {
    title: "Bangalore FinTech for SMEs",
    description: "Digital lending platform for small businesses in Bangalore. Uses AI for credit scoring and connects lenders with verified small and medium enterprises.",
    category: "Technology",
    tags: ["FinTech", "SME Lending", "Bangalore", "AI Credit Scoring", "Digital Lending"],
    fundingGoal: 1900000,
    currentFunding: 380000,
    equityOffered: 21,
    valuation: 8900000,
    stage: "growth" as const,
    timeline: "8 months to reach 1000 SME customers",
    teamSize: 11
  },
  {
    title: "Chennai IoT Smart Agriculture",
    description: "IoT platform for smart farming in Tamil Nadu. Provides soil sensors, weather monitoring, and AI-driven crop recommendations for traditional farmers.",
    category: "Technology",
    tags: ["IoT", "Smart Agriculture", "Chennai", "Soil Sensors", "Crop Recommendations"],
    fundingGoal: 1150000,
    currentFunding: 230000,
    equityOffered: 19,
    valuation: 6000000,
    stage: "mvp" as const,
    timeline: "7 months to farmer network of 500",
    teamSize: 6
  },

  // Renewable Energy (2 ideas)
  {
    title: "Tamil Nadu Solar Panel Manufacturing",
    description: "Solar panel manufacturing facility in Tirunelveli using local silicon. Creates jobs and provides affordable solar solutions for Tamil Nadu's energy needs.",
    category: "Renewable Energy",
    tags: ["Solar Manufacturing", "Tilak", "Tirunelveli", "Local Production", "Energy Solutions"],
    fundingGoal: 3500000,
    currentFunding: 700000,
    equityOffered: 25,
    valuation: 14000000,
    stage: "early" as const,
    timeline: "16 months to production facility",
    teamSize: 18
  },
  {
    title: "Kerala Wind Energy Storage",
    description: "Grid-scale battery storage system for wind farms in Kerala. Addresses intermittency issues and improves renewable energy utilization in the state.",
    category: "Renewable Energy",
    tags: ["Wind Energy", "Battery Storage", "Kerala", "Grid-Scale", "Renewable Integration"],
    fundingGoal: 2900000,
    currentFunding: 580000,
    equityOffered: 20,
    valuation: 14500000,
    stage: "mvp" as const,
    timeline: "12 months to demonstration project",
    teamSize: 12
  },

  // Automotive & Manufacturing (1 idea)
  {
    title: "Bangalore Electric Vehicle Components",
    description: "Manufacturing facility for electric vehicle components in Bangalore. Focuses on battery management systems and charging infrastructure for Karnataka's growing EV market.",
    category: "Automotive",
    tags: ["Electric Vehicles", "Battery Technology", "Bangalore", "Manufacturing", "EV Components"],
    fundingGoal: 3000000,
    currentFunding: 800000,
    equityOffered: 25,
    valuation: 12000000,
    stage: "early" as const,
    timeline: "15 months to production facility",
    teamSize: 15
  }
];

// 30 South Indian Investment Offers (expanded for comprehensive industry coverage)
export const southIndianInvestmentOffers = [
  // Agriculture & AgriTech (4 offers)
  {
    title: "South Indian Agri-Tech Investment Fund",
    description: "Investing in agricultural technology startups across Tamil Nadu, Kerala, and Karnataka. Focus on innovations that support traditional farming communities while improving productivity and sustainability.",
    amountRange: { min: 200000, max: 1500000 },
    preferredEquity: { min: 10, max: 25 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Agriculture", "Food Processing", "Fisheries", "AgriTech"],
    investmentType: "equity" as const,
    timeline: "3-7 year investment horizon"
  },
  {
    title: "Karnataka Organic Farming Venture Fund",
    description: "Supporting organic farming startups in Karnataka with focus on sustainable agriculture, certification, and direct-to-consumer supply chains in Bangalore and Mysore regions.",
    amountRange: { min: 150000, max: 1200000 },
    preferredEquity: { min: 12, max: 22 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Agriculture", "Organic Farming", "Sustainability", "Food Supply Chain"],
    investmentType: "equity" as const,
    timeline: "4-8 year investment horizon"
  },
  {
    title: "Tamil Nadu Coconut Industry Fund",
    description: "Investing in coconut processing and value-added products across Tamil Nadu, Kerala border regions. Focus on modern processing technology and export markets.",
    amountRange: { min: 180000, max: 1300000 },
    preferredEquity: { min: 15, max: 28 },
    preferredStages: ["mvp", "early"],
    preferredIndustries: ["Agriculture", "Coconut Processing", "Food Processing", "Export"],
    investmentType: "convertible" as const,
    timeline: "4-9 year investment horizon"
  },
  {
    title: "South Indian Agricultural Inputs Fund",
    description: "Supporting innovative agricultural input companies providing seeds, fertilizers, and farm machinery solutions for South Indian agricultural communities.",
    amountRange: { min: 250000, max: 1800000 },
    preferredEquity: { min: 18, max: 32 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Agriculture", "Agricultural Inputs", "Farm Machinery", "Seed Technology"],
    investmentType: "equity" as const,
    timeline: "5-10 year investment horizon"
  },

  // Healthcare (4 offers)
  {
    title: "Kerala Healthcare Innovation Fund",
    description: "Supporting healthcare startups in Kerala with focus on traditional medicine, medical tourism, and affordable healthcare solutions for rural communities.",
    amountRange: { min: 150000, max: 1000000 },
    preferredEquity: { min: 12, max: 20 },
    preferredStages: ["mvp", "early", "growth"],
    preferredIndustries: ["Healthcare", "Traditional Medicine", "Medical Tourism", "Medical Devices"],
    investmentType: "equity" as const,
    timeline: "4-8 year investment horizon"
  },
  {
    title: "Tamil Nadu Medical Tourism Partnership Fund",
    description: "Investing in medical tourism infrastructure and technology in Tamil Nadu with focus on Chennai, Vellore, and Coimbatore regions for international healthcare services.",
    amountRange: { min: 300000, max: 2500000 },
    preferredEquity: { min: 20, max: 35 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Medical Tourism", "Healthcare", "Hospital Management", "Health Technology"],
    investmentType: "equity" as const,
    timeline: "5-11 year investment horizon"
  },
  {
    title: "Karnataka Telemedicine Initiative",
    description: "Supporting telemedicine and digital health startups serving Karnataka's rural communities with focus on affordable healthcare access and remote diagnostics.",
    amountRange: { min: 120000, max: 900000 },
    preferredEquity: { min: 10, max: 18 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Healthcare", "Telemedicine", "Digital Health", "Rural Healthcare"],
    investmentType: "convertible" as const,
    timeline: "3-7 year investment horizon"
  },
  {
    title: "South Indian Traditional Medicine Fund",
    description: "Investing in companies preserving and commercializing South India's traditional medicine practices including Ayurveda, Siddha, and Unani systems.",
    amountRange: { min: 180000, max: 1400000 },
    preferredEquity: { min: 14, max: 26 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Traditional Medicine", "Healthcare", "Pharmaceuticals", "Ayurveda"],
    investmentType: "equity" as const,
    timeline: "4-9 year investment horizon"
  },

  // Technology (4 offers)
  {
    title: "Bangalore Technology Innovation Fund",
    description: "Supporting technology startups in Bangalore with focus on software services, edtech, and deep tech innovations for the Karnataka market.",
    amountRange: { min: 250000, max: 1800000 },
    preferredEquity: { min: 14, max: 28 },
    preferredStages: ["mvp", "early", "growth"],
    preferredIndustries: ["Technology", "Software", "Education", "Electronics"],
    investmentType: "equity" as const,
    timeline: "3-6 year investment horizon"
  },
  {
    title: "Hyderabad Biotechnology Fund",
    description: "Investing in biotechnology startups in Hyderabad focusing on life sciences, medical research, and agricultural biotechnology for the Telangana region.",
    amountRange: { min: 400000, max: 3000000 },
    preferredEquity: { min: 16, max: 35 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Biotechnology", "Healthcare", "Agriculture", "Life Sciences"],
    investmentType: "equity" as const,
    timeline: "5-10 year investment horizon"
  },
  {
    title: "Chennai Artificial Intelligence Fund",
    description: "Supporting AI and machine learning startups in Chennai with applications in healthcare, logistics, and financial services for Tamil Nadu.",
    amountRange: { min: 350000, max: 2600000 },
    preferredEquity: { min: 20, max: 38 },
    preferredStages: ["mvp", "early", "growth"],
    preferredIndustries: ["Technology", "Artificial Intelligence", "Machine Learning", "FinTech"],
    investmentType: "equity" as const,
    timeline: "4-8 year investment horizon"
  },
  {
    title: "Kerala Technology Solutions Fund",
    description: "Investing in technology solutions serving Kerala's unique market needs including tourism technology, maritime tech, and education technology.",
    amountRange: { min: 220000, max: 1600000 },
    preferredEquity: { min: 16, max: 30 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Technology", "Tourism Tech", "Maritime Technology", "Education Technology"],
    investmentType: "convertible" as const,
    timeline: "3-7 year investment horizon"
  },

  // Manufacturing (3 offers)
  {
    title: "Tamil Nadu Manufacturing Technology Fund",
    description: "Investing in manufacturing technology and automation solutions for traditional industries in Tamil Nadu including textiles, automotive components, and food processing.",
    amountRange: { min: 300000, max: 2000000 },
    preferredEquity: { min: 15, max: 30 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Manufacturing", "Textiles", "Automotive", "Food Processing"],
    investmentType: "convertible" as const,
    timeline: "5-10 year investment horizon"
  },
  {
    title: "Karnataka Electronic Manufacturing Fund",
    description: "Supporting electronics and semiconductor manufacturing startups in Karnataka with focus on supply chain development and export markets.",
    amountRange: { min: 450000, max: 3500000 },
    preferredEquity: { min: 22, max: 40 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Electronics", "Semiconductors", "Manufacturing", "Export"],
    investmentType: "equity" as const,
    timeline: "6-12 year investment horizon"
  },
  {
    title: "Andhra Pradesh Textile Automation Fund",
    description: "Investing in textile industry automation and smart manufacturing solutions for Andhra Pradesh's traditional textile clusters in Vijayawada and surrounding regions.",
    amountRange: { min: 280000, max: 2100000 },
    preferredEquity: { min: 18, max: 33 },
    preferredStages: ["mvp", "early", "growth"],
    preferredIndustries: ["Textiles", "Manufacturing", "Automation", "Smart Manufacturing"],
    investmentType: "convertible" as const,
    timeline: "4-9 year investment horizon"
  },

  // Fisheries & Food Processing (2 offers)
  {
    title: "Coastal Kerala Fisheries Fund",
    description: "Supporting sustainable fisheries and aquaculture startups in Kerala's coastal regions with focus on technology adoption and market expansion.",
    amountRange: { min: 100000, max: 800000 },
    preferredEquity: { min: 8, max: 18 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Fisheries", "Aquaculture", "Food Processing", "Sustainability"],
    investmentType: "equity" as const,
    timeline: "3-7 year investment horizon"
  },
  {
    title: "Tamil Nadu Food Processing Innovation Fund",
    description: "Investing in food processing and value addition startups across Tamil Nadu with focus on traditional foods, spices, and export-oriented products.",
    amountRange: { min: 180000, max: 1300000 },
    preferredEquity: { min: 14, max: 26 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Food Processing", "Spice Processing", "Agriculture", "Export"],
    investmentType: "convertible" as const,
    timeline: "4-8 year investment horizon"
  },

  // Tourism & Hospitality (2 offers)
  {
    title: "Kerala Tourism Technology Fund",
    description: "Supporting tourism technology startups in Kerala focusing on digital experiences, sustainable tourism, and cultural preservation.",
    amountRange: { min: 180000, max: 1200000 },
    preferredEquity: { min: 13, max: 25 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Tourism", "Hospitality", "Cultural Preservation", "Digital Tourism"],
    investmentType: "equity" as const,
    timeline: "4-7 year investment horizon"
  },
  {
    title: "South Indian Heritage Tourism Fund",
    description: "Investing in heritage tourism development across South India including temple tourism, colonial heritage sites, and cultural experiences.",
    amountRange: { min: 220000, max: 1600000 },
    preferredEquity: { min: 16, max: 29 },
    preferredStages: ["mvp", "early", "growth"],
    preferredIndustries: ["Tourism", "Cultural Tourism", "Heritage Preservation", "Hospitality"],
    investmentType: "equity" as const,
    timeline: "5-10 year investment horizon"
  },

  // Logistics & Port Services (2 offers)
  {
    title: "Chennai Port and Logistics Fund",
    description: "Investing in logistics and supply chain technology for Chennai Port operations and Tamil Nadu's export-import businesses.",
    amountRange: { min: 350000, max: 2500000 },
    preferredEquity: { min: 18, max: 32 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Logistics", "Supply Chain", "Port Technology", "Export-Import"],
    investmentType: "convertible" as const,
    timeline: "5-8 year investment horizon"
  },
  {
    title: "Coastal Logistics Innovation Fund",
    description: "Supporting logistics and transportation startups serving coastal South India with focus on ports, inland container depots, and multimodal transport.",
    amountRange: { min: 350000, max: 2600000 },
    preferredEquity: { min: 20, max: 35 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Logistics", "Port Services", "Transportation", "Supply Chain"],
    investmentType: "equity" as const,
    timeline: "5-10 year investment horizon"
  },

  // Renewable Energy (2 offers)
  {
    title: "South Indian Renewable Energy Fund",
    description: "Investing in renewable energy solutions across South India with focus on solar, wind, and biomass energy for rural electrification.",
    amountRange: { min: 500000, max: 4000000 },
    preferredEquity: { min: 20, max: 40 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Energy", "Solar", "Wind", "Biomass", "Rural Electrification"],
    investmentType: "equity" as const,
    timeline: "6-12 year investment horizon"
  },
  {
    title: "Karnataka Clean Energy Ventures",
    description: "Supporting clean energy startups in Karnataka with focus on microgrids, energy storage, and distributed power solutions for urban and rural markets.",
    amountRange: { min: 450000, max: 3200000 },
    preferredEquity: { min: 22, max: 38 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Renewable Energy", "Energy Storage", "Microgrids", "Clean Energy"],
    investmentType: "convertible" as const,
    timeline: "6-11 year investment horizon"
  },

  // Education & Handicrafts (2 offers)
  {
    title: "South Indian Education Technology Fund",
    description: "Investing in education technology solutions for South India with focus on regional languages, vocational training, and skill development platforms.",
    amountRange: { min: 200000, max: 1400000 },
    preferredEquity: { min: 12, max: 24 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Education Technology", "Skill Development", "Vocational Training", "E-learning"],
    investmentType: "equity" as const,
    timeline: "3-7 year investment horizon"
  },
  {
    title: "Traditional Arts and Crafts Fund",
    description: "Supporting traditional arts and crafts digitization across South India with focus on market expansion and cultural preservation.",
    amountRange: { min: 120000, max: 900000 },
    preferredEquity: { min: 10, max: 22 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Handicrafts", "Traditional Arts", "Cultural Preservation", "E-commerce"],
    investmentType: "convertible" as const,
    timeline: "3-6 year investment horizon"
  }
];

// Sample matches data (10 matches)
export const southIndianMatches = [
  {
    matchScore: 0.89,
    matchingFactors: {
      amountCompatibility: 0.95,
      industryAlignment: 0.92,
      stagePreference: 0.85,
      riskAlignment: 0.88,
    },
    status: "suggested" as const,
  },
  {
    matchScore: 0.76,
    matchingFactors: {
      amountCompatibility: 0.82,
      industryAlignment: 0.85,
      stagePreference: 0.70,
      riskAlignment: 0.75,
    },
    status: "viewed" as const,
  },
  {
    matchScore: 0.94,
    matchingFactors: {
      amountCompatibility: 0.98,
      industryAlignment: 0.96,
      stagePreference: 0.90,
      riskAlignment: 0.92,
    },
    status: "contacted" as const,
  },
  {
    matchScore: 0.68,
    matchingFactors: {
      amountCompatibility: 0.75,
      industryAlignment: 0.78,
      stagePreference: 0.62,
      riskAlignment: 0.65,
    },
    status: "suggested" as const,
  },
  {
    matchScore: 0.82,
    matchingFactors: {
      amountCompatibility: 0.88,
      industryAlignment: 0.90,
      stagePreference: 0.76,
      riskAlignment: 0.80,
    },
    status: "negotiating" as const,
  },
  {
    matchScore: 0.91,
    matchingFactors: {
      amountCompatibility: 0.96,
      industryAlignment: 0.94,
      stagePreference: 0.87,
      riskAlignment: 0.89,
    },
    status: "invested" as const,
  },
  {
    matchScore: 0.73,
    matchingFactors: {
      amountCompatibility: 0.80,
      industryAlignment: 0.83,
      stagePreference: 0.68,
      riskAlignment: 0.72,
    },
    status: "suggested" as const,
  },
  {
    matchScore: 0.85,
    matchingFactors: {
      amountCompatibility: 0.90,
      industryAlignment: 0.92,
      stagePreference: 0.79,
      riskAlignment: 0.84,
    },
    status: "viewed" as const,
  },
  {
    matchScore: 0.78,
    matchingFactors: {
      amountCompatibility: 0.84,
      industryAlignment: 0.87,
      stagePreference: 0.72,
      riskAlignment: 0.76,
    },
    status: "contacted" as const,
  },
  {
    matchScore: 0.87,
    matchingFactors: {
      amountCompatibility: 0.92,
      industryAlignment: 0.93,
      stagePreference: 0.81,
      riskAlignment: 0.86,
    },
    status: "negotiating" as const,
  }
];

// Sample transactions data (10 transactions)
export const southIndianTransactions = [
  {
    amount: 500000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 300000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 750000,
    currency: "INR",
    status: "pending" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 200000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 900000,
    currency: "INR",
    status: "confirmed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 400000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 600000,
    currency: "INR",
    status: "pending" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 350000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 800000,
    currency: "INR",
    status: "confirmed" as const,
    paymentMethod: "bank_transfer" as const,
  },
  {
    amount: 250000,
    currency: "INR",
    status: "completed" as const,
    paymentMethod: "bank_transfer" as const,
  }
];

// Sample favorites data (10 favorites)
export const southIndianFavorites = [
  { itemType: "offer" as const },
  { itemType: "idea" as const },
  { itemType: "offer" as const },
  { itemType: "idea" as const },
  { itemType: "offer" as const },
  { itemType: "idea" as const },
  { itemType: "offer" as const },
  { itemType: "idea" as const },
  { itemType: "offer" as const },
  { itemType: "idea" as const }
];

// Helper functions
export function getRandomTimestamp(daysAgo: number = 30): number {
  const now = Date.now();
  const randomDays = Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000;
  return now - randomDays;
}

export function getRandomCurrentFunding(goal: number, maxPercentage: number = 0.6): number {
  const maxFunding = Math.floor(goal * maxPercentage);
  return Math.floor(Math.random() * maxFunding);
}

export function getRandomSouthIndianCity(): string {
  return southIndianCities[Math.floor(Math.random() * southIndianCities.length)];
}

export function getRandomSouthIndianIndustry(): string {
  return southIndianIndustries[Math.floor(Math.random() * southIndianIndustries.length)];
}
