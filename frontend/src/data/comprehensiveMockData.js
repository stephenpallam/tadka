// Comprehensive mock data for Blog CMS frontend
export const mockData = {
  // Featured/Breaking Story
  bigStory: {
    id: 1,
    title: "Major Political Development Shakes State Assembly",
    image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=320&h=180&fit=crop",
    content: "In a significant turn of events, the state assembly witnessed unprecedented scenes as lawmakers debated the new infrastructure bill. The comprehensive legislation promises to transform the region's transportation network over the next decade.",
    category: "Breaking",
    publishedAt: "2025-01-28T10:00:00Z",
    author: "Political Correspondent"
  },

  // Movie Reviews - Expanded dataset spanning the past year for comprehensive filter testing
  movieReviews: [
    // Base date: June 30, 2026 (current date)
    // Today's reviews
    {
      id: 1,
      title: "Epic Fantasy Adventure Exceeds All Expectations",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T10:00:00Z').toISOString(), // Today
      reviewer: "Film Critic",
      category: "reviews",
      summary: "A breathtaking fantasy epic that combines stunning visuals, compelling characters, and an emotionally resonant story that will leave audiences spellbound."
    },
    {
      id: 25,
      title: "Indie Drama Showcases Exceptional Performances",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T15:30:00Z').toISOString(), // Today
      reviewer: "Independent Cinema Expert",
      category: "reviews",
      summary: "An intimate character study that showcases the power of exceptional acting and thoughtful direction in independent filmmaking."
    },
    
    // Yesterday's reviews
    {
      id: 2,
      title: "Action Thriller Delivers Non-Stop Entertainment",
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T11:15:00Z').toISOString(), // Yesterday
      reviewer: "Action Film Specialist",
      category: "reviews",
      summary: "High-octane action sequences and stellar choreography make this thriller a must-see for adrenaline junkies and film enthusiasts alike."
    },
    {
      id: 26,
      title: "Romantic Comedy Brings Fresh Perspective to Genre",
      rating: 3.9,
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T17:45:00Z').toISOString(), // Yesterday
      reviewer: "Romance Genre Expert",
      category: "reviews",
      summary: "A delightfully witty romantic comedy that subverts genre expectations while delivering genuine laughs and heartfelt moments."
    },
    
    // This week (2-7 days ago)
    {
      id: 3,
      title: "Sci-Fi Masterpiece Redefines Visual Storytelling",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-28T12:20:00Z').toISOString(), // 2 days ago
      reviewer: "Science Fiction Analyst",
      category: "reviews",
      summary: "Groundbreaking visual effects and intelligent storytelling create a science fiction experience that pushes the boundaries of cinema."
    },
    {
      id: 4,
      title: "Historical Drama Captures Period Authenticity",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-27T14:45:00Z').toISOString(), // 3 days ago
      reviewer: "Period Film Specialist",
      category: "reviews",
      summary: "Meticulous attention to historical detail and powerful performances bring this important chapter of history to vivid life."
    },
    {
      id: 5,
      title: "Horror Film Delivers Genuine Scares and Substance",
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-26T09:30:00Z').toISOString(), // 4 days ago
      reviewer: "Horror Cinema Expert",
      category: "reviews",
      summary: "Psychological terror and atmospheric tension create a horror experience that relies on genuine scares rather than cheap thrills."
    },
    {
      id: 6,
      title: "Animated Feature Appeals to All Ages",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1606177068212-1d3e4cd0d8be?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-25T16:15:00Z').toISOString(), // 5 days ago
      reviewer: "Animation Critic",
      category: "reviews",
      summary: "Beautiful animation and universal themes create an animated masterpiece that resonates with viewers of every generation."
    },
    {
      id: 27,
      title: "Musical Biography Celebrates Legendary Artist",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-24T13:00:00Z').toISOString(), // 6 days ago
      reviewer: "Musical Film Critic",
      category: "reviews",
      summary: "An inspiring biographical musical that honors a legendary artist while delivering outstanding musical performances and emotional depth."
    },
    
    // Last 7-14 days
    {
      id: 7,
      title: "Documentary Exposes Important Social Issues",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-22T11:30:00Z').toISOString(), // 8 days ago
      reviewer: "Documentary Specialist",
      category: "reviews",
      summary: "Compelling investigative work and powerful testimonies create a documentary that demands attention and inspires action."
    },
    {
      id: 8,
      title: "Crime Drama Explores Moral Complexity",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-20T15:15:00Z').toISOString(), // 10 days ago
      reviewer: "Crime Genre Analyst",
      category: "reviews",
      summary: "A sophisticated crime drama that examines the gray areas of morality through compelling characters and intricate plotting."
    },
    {
      id: 9,
      title: "Family Adventure Creates Lasting Memories",
      rating: 3.8,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-18T10:45:00Z').toISOString(), // 12 days ago
      reviewer: "Family Film Expert",
      category: "reviews",
      summary: "Wholesome adventure and positive messages make this family film an excellent choice for viewers seeking uplifting entertainment."
    },
    {
      id: 10,
      title: "International Film Offers Cultural Insights",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1518869175114-83ea80a3b9c1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-15T17:30:00Z').toISOString(), // 15 days ago
      reviewer: "World Cinema Critic",
      category: "reviews",
      summary: "A beautiful international film that provides profound cultural insights while telling a universally relatable human story."
    },
    
    // Last 30 days (1 month)
    {
      id: 11,
      title: "Psychological Thriller Keeps Audiences Guessing",
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-05T12:20:00Z').toISOString(), // 25 days ago
      reviewer: "Thriller Specialist",
      category: "reviews",
      summary: "Masterful suspense and unexpected plot twists create a psychological thriller that will keep viewers on the edge of their seats."
    },
    {
      id: 12,
      title: "War Epic Honors Military Sacrifice",
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-02T15:45:00Z').toISOString(), // 28 days ago
      reviewer: "War Film Historian",
      category: "reviews",
      summary: "A respectful and powerful war epic that honors military sacrifice while examining the human cost of conflict."
    },
    
    // Last 3 months (90 days)
    {
      id: 13,
      title: "Comedy-Drama Balances Humor and Heart",
      rating: 3.9,
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-16T14:30:00Z').toISOString(), // 45 days ago
      reviewer: "Genre Specialist",
      category: "reviews",
      summary: "A skillful blend of comedy and drama that finds humor in life's challenges while maintaining emotional authenticity."
    },
    {
      id: 14,
      title: "Superhero Film Redefines Comic Book Movies",
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-01T11:15:00Z').toISOString(), // 60 days ago
      reviewer: "Superhero Film Expert",
      category: "reviews",
      summary: "Innovative storytelling and character development elevate this superhero film above typical comic book movie conventions."
    },
    {
      id: 15,
      title: "Arthouse Film Challenges Conventional Narrative",
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-16T16:45:00Z').toISOString(), // 75 days ago
      reviewer: "Arthouse Cinema Critic",
      category: "reviews",
      summary: "An experimental film that challenges traditional narrative structures while delivering a thought-provoking artistic experience."
    },
    {
      id: 16,
      title: "Western Revival Captures Classic Genre Spirit",
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-06T13:20:00Z').toISOString(), // 85 days ago
      reviewer: "Western Genre Expert",
      category: "reviews",
      summary: "A modern western that captures the spirit of classic genre films while addressing contemporary themes and sensibilities."
    },
    
    // Last 6 months (180 days)
    {
      id: 17,
      title: "Biographical Drama Honors Historical Figure",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-03-02T10:30:00Z').toISOString(), // 120 days ago
      reviewer: "Biographical Film Specialist",
      category: "reviews",
      summary: "A respectful and insightful biographical drama that brings an important historical figure's story to compelling life."
    },
    {
      id: 18,
      title: "Mystery Film Delivers Clever Plot Twists",
      rating: 3.8,
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h-100&fit=crop",
      publishedAt: new Date('2026-02-01T12:45:00Z').toISOString(), // 150 days ago
      reviewer: "Mystery Genre Critic",
      category: "reviews",
      summary: "Intricate plotting and well-developed characters create a mystery that keeps audiences engaged until the final revelation."
    },
    {
      id: 19,
      title: "Sports Drama Inspires Through Athletic Achievement",
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-01-12T15:20:00Z').toISOString(), // 170 days ago
      reviewer: "Sports Film Analyst",
      category: "reviews",
      summary: "An uplifting sports drama that celebrates athletic achievement while exploring themes of perseverance and determination."
    },
    
    // Last year (365 days)
    {
      id: 20,
      title: "Drama Series Finale Concludes Epic Story",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-11-03T17:00:00Z').toISOString(), // 240 days ago
      reviewer: "Television Drama Critic",
      category: "reviews",
      summary: "The final season of this acclaimed drama series provides a satisfying conclusion to years of compelling storytelling."
    },
    {
      id: 21,
      title: "Foreign Language Film Transcends Cultural Barriers",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1518869175114-83ea80a3b9c1?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-09-04T14:15:00Z').toISOString(), // 300 days ago
      reviewer: "International Cinema Expert",
      category: "reviews",
      summary: "A powerful foreign language film that demonstrates cinema's ability to transcend cultural and linguistic boundaries."
    },
    {
      id: 22,
      title: "Teen Drama Addresses Important Youth Issues",
      rating: 3.7,
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-08-05T11:30:00Z').toISOString(), // 330 days ago
      reviewer: "Youth Film Specialist",
      category: "reviews",
      summary: "A thoughtful teen drama that addresses important issues facing young people with sensitivity and authenticity."
    },
    {
      id: 23,
      title: "Experimental Film Pushes Artistic Boundaries",
      rating: 3.9,
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-16T16:45:00Z').toISOString(), // 350 days ago
      reviewer: "Experimental Cinema Critic",
      category: "reviews",
      summary: "An avant-garde film that challenges viewers while exploring new possibilities in cinematic expression and storytelling."
    },
    {
      id: 24,
      title: "Classic Remake Honors Original While Adding New Perspective",
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-06T13:00:00Z').toISOString(), // 360 days ago
      reviewer: "Classic Film Expert",
      category: "reviews",
      summary: "A respectful remake that honors the original classic while bringing fresh perspective and modern filmmaking techniques."
    }
  ],

  // Featured Entertainment Story
  featuredEntertainmentStory: {
    id: 101,
    title: "Celebrity Wedding of the Year Captivates Fans Worldwide",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=320&h=180&fit=crop",
    summary: "The entertainment industry's most anticipated wedding brings together two beloved stars in a fairy-tale ceremony.",
    content: "In what's being called the wedding of the century, two of the industry's biggest stars tied the knot in an intimate ceremony surrounded by family and close friends. The celebration was a perfect blend of tradition and modern elegance.",
    category: "Entertainment",
    author: "Entertainment Reporter",
    publishedAt: "2025-01-28T08:00:00Z"
  },

  // Top News Articles
  topNews: [
    { id: 201, title: "Economic Growth Reaches New Heights This Quarter", publishedAt: "2025-01-28T09:00:00Z" },
    { id: 202, title: "Infrastructure Development Project Announced", publishedAt: "2025-01-28T08:30:00Z" },
    { id: 203, title: "Education Reforms Set to Transform Learning", publishedAt: "2025-01-28T08:00:00Z" },
    { id: 204, title: "Healthcare Initiative Reaches Rural Areas", publishedAt: "2025-01-27T19:30:00Z" },
    { id: 205, title: "Technology Sector Shows Remarkable Progress", publishedAt: "2025-01-27T18:45:00Z" },
    { id: 206, title: "Environmental Conservation Efforts Intensify", publishedAt: "2025-01-27T17:20:00Z" },
    { id: 207, title: "Cultural Festival Celebrates Regional Heritage", publishedAt: "2025-01-27T16:00:00Z" },
    { id: 208, title: "Sports Championship Draws Record Attendance", publishedAt: "2025-01-27T15:30:00Z" },
    { id: 209, title: "Agricultural Innovations Boost Crop Yields", publishedAt: "2025-01-27T14:45:00Z" },
    { id: 210, title: "Transportation Network Expansion Plans Unveiled", publishedAt: "2025-01-27T13:20:00Z" },
    { id: 211, title: "Digital Literacy Programs Launch Statewide", publishedAt: "2025-01-27T12:00:00Z" },
    { id: 212, title: "Renewable Energy Projects Gain Momentum", publishedAt: "2025-01-27T11:30:00Z" },
    { id: 213, title: "Youth Development Initiatives Show Success", publishedAt: "2025-01-27T10:45:00Z" },
    { id: 214, title: "Tourism Industry Reports Strong Recovery", publishedAt: "2025-01-27T10:00:00Z" },
    { id: 215, title: "Innovation Hub Attracts Global Investors", publishedAt: "2025-01-27T09:15:00Z" }
  ],

  // Political News - Expanded dataset spanning the past year for comprehensive filter testing
  politicalNews: [
    // Base date: June 30, 2026 (current date)
    // Today's articles
    {
      id: 1,
      title: "Government Announces New Infrastructure Development Plan",
      category: "politics",
      image: "https://images.unsplash.com/photo-1586339949216-35c890863684?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T10:00:00Z').toISOString(), // Today
      summary: "The government has unveiled a comprehensive infrastructure development plan that promises to revolutionize transportation and connectivity across the nation."
    },
    {
      id: 101,
      title: "Breaking: Emergency Parliamentary Session Called",
      category: "politics",
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T14:30:00Z').toISOString(), // Today
      summary: "An emergency session has been called to address urgent national security concerns following recent international developments."
    },
    
    // Yesterday's articles
    {
      id: 2,
      title: "Opposition Parties Unite for Constitutional Amendment",
      category: "politics", 
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T09:15:00Z').toISOString(), // Yesterday
      summary: "Multiple opposition parties have come together to propose significant constitutional amendments focusing on electoral reforms."
    },
    {
      id: 102,
      title: "Supreme Court Delivers Landmark Verdict",
      category: "politics",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T16:45:00Z').toISOString(), // Yesterday
      summary: "The Supreme Court's ruling on constitutional matters will have far-reaching implications for federal governance."
    },
    
    // This week (2-7 days ago)
    {
      id: 3,
      title: "Trade Relations Strengthen with Neighboring Countries",
      category: "politics",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150&h=100&fit=crop", 
      publishedAt: new Date('2026-06-28T11:20:00Z').toISOString(), // 2 days ago
      summary: "The foreign ministry announced successful completion of trade negotiations that will boost economic cooperation in the region."
    },
    {
      id: 4,
      title: "Environmental Policy Reforms Gain Parliamentary Support",
      category: "politics",
      image: "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-27T13:45:00Z').toISOString(), // 3 days ago
      summary: "New environmental protection policies have received overwhelming support from parliamentarians across party lines."
    },
    {
      id: 5,
      title: "Education Sector Receives Major Budget Allocation",
      category: "politics",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-26T08:30:00Z').toISOString(), // 4 days ago
      summary: "The education ministry announced a significant increase in budget allocation for improving educational infrastructure."
    },
    {
      id: 6,
      title: "Healthcare Reforms Address Rural Access Issues", 
      category: "politics",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-25T15:15:00Z').toISOString(), // 5 days ago
      summary: "New healthcare policies aim to improve medical access and quality in rural areas through expanded telemedicine programs."
    },
    {
      id: 103,
      title: "Defense Minister Announces Modernization Plan",
      category: "politics",
      image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-24T12:00:00Z').toISOString(), // 6 days ago
      summary: "A comprehensive defense modernization program aims to strengthen national security capabilities over the next decade."
    },
    
    // Last 7-14 days
    {
      id: 7,
      title: "Digital Governance Initiative Launches Nationwide",
      category: "politics", 
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-22T10:30:00Z').toISOString(), // 8 days ago
      summary: "A comprehensive digital governance platform has been launched to streamline citizen services and improve government transparency."
    },
    {
      id: 104,
      title: "Foreign Secretary Concludes Diplomatic Tour",
      category: "politics",
      image: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-20T14:15:00Z').toISOString(), // 10 days ago
      summary: "Strategic discussions with multiple nations aim to enhance bilateral cooperation and regional stability."
    },
    {
      id: 105,
      title: "Tax Reform Bill Passes Committee Review",
      category: "politics",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-18T09:45:00Z').toISOString(), // 12 days ago
      summary: "The proposed tax reforms promise to simplify the system while ensuring fair revenue collection."
    },
    {
      id: 8,
      title: "Economic Stimulus Package Shows Positive Results",
      category: "politics",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&h=100&fit=crop", 
      publishedAt: new Date('2026-06-15T16:30:00Z').toISOString(), // 15 days ago
      summary: "The economic stimulus measures implemented last quarter are showing encouraging results in job creation and GDP growth."
    },
    
    // Last 30 days (1 month)
    {
      id: 106,
      title: "Census Data Reveals Demographic Shifts",
      category: "politics",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-05T11:20:00Z').toISOString(), // 25 days ago
      summary: "New census information provides insights into population changes and their implications for policy making."
    },
    {
      id: 107,
      title: "Agriculture Ministry Launches Farmer Support Program",
      category: "politics",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-02T14:45:00Z').toISOString(), // 28 days ago
      summary: "Comprehensive support initiatives aim to boost agricultural productivity and farmer incomes across the nation."
    },
    
    // Last 3 months (90 days)
    {
      id: 108,
      title: "Regional Cooperation Summit Concludes Successfully",
      category: "politics",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-16T13:30:00Z').toISOString(), // 45 days ago
      summary: "Leaders from neighboring countries agreed on key cooperation frameworks for economic and social development."
    },
    {
      id: 109,
      title: "Energy Independence Plan Receives Cabinet Approval",
      category: "politics",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-01T10:15:00Z').toISOString(), // 60 days ago
      summary: "A comprehensive strategy to achieve energy independence through renewable sources and technological innovation."
    },
    {
      id: 110,
      title: "Infrastructure Development Authority Established",
      category: "politics",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-16T15:45:00Z').toISOString(), // 75 days ago
      summary: "A new authority will oversee major infrastructure projects to ensure timely completion and quality standards."
    },
    {
      id: 111,
      title: "National Skill Development Initiative Launched",
      category: "politics",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-06T12:20:00Z').toISOString(), // 85 days ago
      summary: "Large-scale skill development programs aim to prepare the workforce for emerging industries and technologies."
    },
    
    // Last 6 months (180 days)
    {
      id: 112,
      title: "Judicial Reforms Enhance Access to Justice",
      category: "politics",
      image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-03-02T09:30:00Z').toISOString(), // 120 days ago
      summary: "New judicial procedures and technology integration promise faster case resolution and better citizen access."
    },
    {
      id: 113,
      title: "Border Security Enhancement Program Initiated",
      category: "politics",
      image: "https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-02-01T11:45:00Z').toISOString(), // 150 days ago
      summary: "Advanced security measures and infrastructure improvements strengthen border monitoring and protection."
    },
    {
      id: 114,
      title: "Climate Action Plan Receives International Recognition",
      category: "politics",
      image: "https://images.unsplash.com/photo-1569025743873-ea3a9ade89f9?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-01-12T14:20:00Z').toISOString(), // 170 days ago
      summary: "The nation's comprehensive climate strategy earns praise from international environmental organizations."
    },
    
    // Last year (365 days)
    {
      id: 115,
      title: "Constitutional Convention Addresses Democratic Reforms",
      category: "politics",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-11-03T16:00:00Z').toISOString(), // 240 days ago
      summary: "Representatives from all states gather to discuss constitutional amendments that would strengthen democratic institutions."
    },
    {
      id: 116,
      title: "National Innovation Strategy Drives Technology Growth",
      category: "politics",
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-09-04T13:15:00Z').toISOString(), // 300 days ago
      summary: "Government initiatives to promote innovation and technology adoption show significant progress across sectors."
    },
    {
      id: 117,
      title: "International Trade Agreement Expands Market Access",
      category: "politics",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-08-05T10:30:00Z').toISOString(), // 330 days ago
      summary: "New trade partnerships open up international markets for domestic products and services."
    },
    {
      id: 118,
      title: "National Security Council Reviews Defense Policies",
      category: "politics",
      image: "https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-16T15:45:00Z').toISOString(), // 350 days ago
      summary: "Comprehensive defense policy review addresses emerging security challenges and strategic priorities."
    },
    {
      id: 119,
      title: "Federal Budget Priorities Focus on Social Development",
      category: "politics",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-06T12:00:00Z').toISOString(), // 360 days ago
      summary: "The annual budget emphasizes social welfare programs and infrastructure development to improve quality of life."
    }
  ],

  // Talk of the Town
  talkOfTown: [
    { id: 401, title: "Local Artist's Exhibition Draws International Attention", publishedAt: "2025-01-28T06:30:00Z" },
    { id: 402, title: "Community Garden Project Transforms Neighborhood", publishedAt: "2025-01-28T06:00:00Z" },
    { id: 403, title: "Small Business Owner's Success Story Inspires Many", publishedAt: "2025-01-27T21:30:00Z" },
    { id: 404, title: "Historic Building Restoration Nears Completion", publishedAt: "2025-01-27T21:00:00Z" },
    { id: 405, title: "Youth Orchestra Wins National Competition", publishedAt: "2025-01-27T20:45:00Z" },
    { id: 406, title: "Volunteer Group's Charity Drive Exceeds Goals", publishedAt: "2025-01-27T20:15:00Z" },
    { id: 407, title: "Local Chef's Restaurant Receives Prestigious Award", publishedAt: "2025-01-27T19:45:00Z" },
    { id: 408, title: "Street Art Festival Brings Color to City Walls", publishedAt: "2025-01-27T19:15:00Z" },
    { id: 409, title: "Community Library Celebrates 50th Anniversary", publishedAt: "2025-01-27T18:45:00Z" },
    { id: 410, title: "High School Students Win Science Fair", publishedAt: "2025-01-27T18:15:00Z" },
    { id: 411, title: "Local Farmer's Organic Produce Gains Recognition", publishedAt: "2025-01-27T17:45:00Z" },
    { id: 412, title: "Neighborhood Watch Program Enhances Safety", publishedAt: "2025-01-27T17:15:00Z" },
    { id: 413, title: "Senior Center's Dance Class Becomes Social Hit", publishedAt: "2025-01-27T16:45:00Z" },
    { id: 414, title: "Local Bookstore Hosts Best-Selling Author", publishedAt: "2025-01-27T16:15:00Z" },
    { id: 415, title: "Community Cleanup Drive Shows Civic Pride", publishedAt: "2025-01-27T15:45:00Z" }
  ],

  // Entertainment News
  entertainmentNews: [
    { id: 501, title: "Music Festival Lineup Announced for Summer", publishedAt: "2025-01-28T05:30:00Z" },
    { id: 502, title: "Theater Company Premieres Original Production", publishedAt: "2025-01-28T05:00:00Z" },
    { id: 503, title: "Celebrity Couple Announces Engagement", publishedAt: "2025-01-27T22:30:00Z" },
    { id: 504, title: "Reality TV Show Casting Call Draws Thousands", publishedAt: "2025-01-27T22:00:00Z" },
    { id: 505, title: "Award Season Predictions Create Buzz", publishedAt: "2025-01-27T21:45:00Z" },
    { id: 506, title: "Streaming Platform Announces New Original Series", publishedAt: "2025-01-27T21:15:00Z" },
    { id: 507, title: "Concert Tour Tickets Sell Out in Minutes", publishedAt: "2025-01-27T20:45:00Z" },
    { id: 508, title: "Fashion Week Showcases Latest Trends", publishedAt: "2025-01-27T20:15:00Z" },
    { id: 509, title: "Documentary Film Festival Highlights Social Issues", publishedAt: "2025-01-27T19:45:00Z" },
    { id: 510, title: "Celebrity Chef Opens New Restaurant Chain", publishedAt: "2025-01-27T19:15:00Z" },
    { id: 511, title: "Art Gallery Features Contemporary Masters", publishedAt: "2025-01-27T18:45:00Z" },
    { id: 512, title: "Comedy Club Circuit Welcomes New Talent", publishedAt: "2025-01-27T18:15:00Z" },
    { id: 513, title: "Film Festival Submissions Break Records", publishedAt: "2025-01-27T17:45:00Z" },
    { id: 514, title: "Dance Competition Showcases Regional Styles", publishedAt: "2025-01-27T17:15:00Z" },
    { id: 515, title: "Cultural Exchange Program Promotes Arts", publishedAt: "2025-01-27T16:45:00Z" }
  ],

  // Featured Images
  featuredImages: [
    {
      id: 1,
      title: "Breaking: Major Infrastructure Project Unveiled",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=185&h=110&fit=crop",
      link: "/articles/1"
    },
    {
      id: 2,
      title: "Sports Championship Victory Celebration",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=185&h=110&fit=crop",
      link: "/articles/2"
    },
    {
      id: 3,
      title: "Cultural Festival Brings Community Together",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=185&h=110&fit=crop",
      link: "/articles/3"
    },
    {
      id: 4,
      title: "Technology Innovation Summit Success",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=185&h=110&fit=crop",
      link: "/articles/4"
    },
    {
      id: 5,
      title: "Environmental Conservation Achievement",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=185&h=110&fit=crop",
      link: "/articles/5"
    }
  ],

  // Large Feature Image
  largeFeatureImage: {
    id: 1,
    title: "Economic Growth Reaches New Milestones",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1300&h=400&fit=crop",
    link: "/articles/1"
  },

  // Movie News - Expanded dataset spanning the past year for comprehensive filter testing
  movieNews: [
    // Base date: June 30, 2026 (current date)
    // Today's articles
    {
      id: 601,
      title: "Blockbuster Superhero Film Breaks Opening Day Records",
      category: "movies",
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T10:00:00Z').toISOString(), // Today
      summary: "The latest superhero blockbuster has shattered previous opening day box office records, earning over $100 million worldwide in its first 24 hours."
    },
    {
      id: 701,
      title: "Award-Winning Director Announces Next Sci-Fi Epic",
      category: "movies",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-30T15:30:00Z').toISOString(), // Today
      summary: "The acclaimed director behind last year's Oscar winner reveals details about an ambitious new science fiction project set to begin production next year."
    },
    
    // Yesterday's articles
    {
      id: 602,
      title: "Independent Film Festival Celebrates Emerging Talent",
      category: "movies",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T11:15:00Z').toISOString(), // Yesterday
      summary: "The annual independent film festival showcases breakthrough performances and innovative storytelling from upcoming filmmakers around the world."
    },
    {
      id: 702,
      title: "Hollywood A-Lister Joins Major Fantasy Franchise",
      category: "movies",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-29T17:45:00Z').toISOString(), // Yesterday
      summary: "A major casting announcement reveals that a beloved Hollywood star will play a key role in the highly anticipated fantasy series adaptation."
    },
    
    // This week (2-7 days ago)
    {
      id: 603,
      title: "Documentary About Climate Change Wins International Prize",
      category: "movies",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-28T12:20:00Z').toISOString(), // 2 days ago
      summary: "An environmental documentary examining climate change impacts receives prestigious international recognition for its compelling storytelling and impact."
    },
    {
      id: 604,
      title: "Streaming Platform Greenlights Original Thriller Series",
      category: "movies",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-27T14:45:00Z').toISOString(), // 3 days ago
      summary: "A major streaming service announces a new psychological thriller series featuring an ensemble cast of renowned international actors."
    },
    {
      id: 605,
      title: "Animation Studio Reveals Groundbreaking Visual Effects",
      category: "movies",
      image: "https://images.unsplash.com/photo-1606177068212-1d3e4cd0d8be?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-26T09:30:00Z').toISOString(), // 4 days ago
      summary: "Revolutionary animation techniques create stunning visual effects that blur the line between reality and digital artistry in upcoming releases."
    },
    {
      id: 606,
      title: "International Co-Production Bridges Cultural Boundaries",
      category: "movies",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-25T16:15:00Z').toISOString(), // 5 days ago
      summary: "A collaborative film project brings together talent from multiple countries to tell a universal story of human connection and understanding."
    },
    {
      id: 703,
      title: "Classic Film Gets Modern Remake Treatment",
      category: "movies",
      image: "https://images.unsplash.com/photo-1518869175114-83ea80a3b9c1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-24T13:00:00Z').toISOString(), // 6 days ago
      summary: "A beloved classic from decades past receives a contemporary update while honoring the spirit and themes of the original masterpiece."
    },
    
    // Last 7-14 days
    {
      id: 607,
      title: "Film Festival Circuit Embraces Virtual Reality Cinema",
      category: "movies",
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-22T11:30:00Z').toISOString(), // 8 days ago
      summary: "Major film festivals worldwide begin incorporating virtual reality experiences, offering audiences immersive storytelling like never before."
    },
    {
      id: 704,
      title: "Behind-the-Scenes Look at Epic Action Sequences",
      category: "movies",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-20T15:15:00Z').toISOString(), // 10 days ago
      summary: "Exclusive footage reveals the incredible stunt work and practical effects that bring heart-pounding action sequences to life on the big screen."
    },
    {
      id: 608,
      title: "Emerging Actress Lands Lead Role in Period Drama",
      category: "movies",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-18T10:45:00Z').toISOString(), // 12 days ago
      summary: "A rising star takes on her most challenging role yet in a lavish period drama that explores themes of love, sacrifice, and social change."
    },
    {
      id: 609,
      title: "Box Office Analysis Reveals Changing Audience Preferences",
      category: "movies",
      image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-15T17:30:00Z').toISOString(), // 15 days ago
      summary: "Industry experts analyze recent box office trends that indicate shifting audience preferences toward character-driven narratives and diverse storytelling."
    },
    
    // Last 30 days (1 month)
    {
      id: 610,
      title: "Production Company Commits to Sustainable Filmmaking",
      category: "movies",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-05T12:20:00Z').toISOString(), // 25 days ago
      summary: "A major production company announces comprehensive environmental initiatives to reduce the carbon footprint of film and television production."
    },
    {
      id: 611,
      title: "International Film Market Explores New Distribution Models",
      category: "movies",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-06-02T15:45:00Z').toISOString(), // 28 days ago
      summary: "Film distributors worldwide experiment with innovative release strategies that combine theatrical, streaming, and interactive viewing experiences."
    },
    
    // Last 3 months (90 days)
    {
      id: 612,
      title: "Film School Graduates Showcase Innovative Short Films",
      category: "movies",
      image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-16T14:30:00Z').toISOString(), // 45 days ago
      summary: "Talented film school graduates present a diverse collection of short films that explore contemporary themes through creative visual storytelling."
    },
    {
      id: 613,
      title: "Celebrity Endorsement Boosts Independent Film Visibility",
      category: "movies",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-05-01T11:15:00Z').toISOString(), // 60 days ago
      summary: "High-profile celebrity support helps bring attention to a low-budget independent film that tackles important social justice issues."
    },
    {
      id: 614,
      title: "Motion Capture Technology Advances Character Animation",
      category: "movies",
      image: "https://images.unsplash.com/photo-1606177068212-1d3e4cd0d8be?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-16T16:45:00Z').toISOString(), // 75 days ago
      summary: "Cutting-edge motion capture technology creates unprecedented realism in digital character performances for upcoming fantasy epics."
    },
    {
      id: 615,
      title: "Film Preservation Project Saves Cinema History",
      category: "movies",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-04-06T13:20:00Z').toISOString(), // 85 days ago
      summary: "A dedicated preservation initiative rescues rare films from deterioration, ensuring future generations can experience cinema's rich heritage."
    },
    
    // Last 6 months (180 days)
    {
      id: 616,
      title: "Streaming Wars Intensify with Original Content Push",
      category: "movies",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-03-02T10:30:00Z').toISOString(), // 120 days ago
      summary: "Major streaming platforms invest heavily in original programming, creating unprecedented opportunities for diverse voices in entertainment."
    },
    {
      id: 617,
      title: "International Cinema Gains Global Recognition",
      category: "movies",
      image: "https://images.unsplash.com/photo-1518869175114-83ea80a3b9c1?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-02-01T12:45:00Z').toISOString(), // 150 days ago
      summary: "Films from non-English speaking countries achieve remarkable success in international markets, celebrating diverse cultural perspectives."
    },
    {
      id: 618,
      title: "Film Industry Embraces Artificial Intelligence Tools",
      category: "movies",
      image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=150&h=100&fit=crop",
      publishedAt: new Date('2026-01-12T15:20:00Z').toISOString(), // 170 days ago
      summary: "Filmmakers explore how artificial intelligence can enhance creative processes while maintaining the human element in storytelling."
    },
    
    // Last year (365 days)
    {
      id: 619,
      title: "Award Season Celebrates Diverse Storytelling",
      category: "movies",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-11-03T17:00:00Z').toISOString(), // 240 days ago
      summary: "This year's award ceremonies highlight the importance of inclusive narratives that represent diverse communities and experiences."
    },
    {
      id: 620,
      title: "Cinema Technology Evolution Transforms Viewing Experience",
      category: "movies",
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-09-04T14:15:00Z').toISOString(), // 300 days ago
      summary: "Advanced projection systems and immersive audio technologies create unparalleled cinema experiences that transport audiences into stories."
    },
    {
      id: 621,
      title: "Film Education Programs Expand Globally",
      category: "movies",
      image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-08-05T11:30:00Z').toISOString(), // 330 days ago
      summary: "Educational institutions worldwide expand film studies programs to meet growing demand for creative and technical skills in entertainment."
    },
    {
      id: 622,
      title: "Independent Theaters Adapt to Changing Industry",
      category: "movies",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-16T16:45:00Z').toISOString(), // 350 days ago
      summary: "Local cinema venues innovate with unique programming and community events to remain vital cultural centers in the digital age."
    },
    {
      id: 623,
      title: "Cross-Media Franchises Redefine Entertainment",
      category: "movies",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop",
      publishedAt: new Date('2025-07-06T13:00:00Z').toISOString(), // 360 days ago
      summary: "Entertainment franchises expand across multiple platforms, creating interconnected experiences that engage audiences through various media."
    }
  ],

  // Bottom Section Categories
  movieGossip: [
    { id: 701, title: "Behind-the-Scenes Drama on Movie Set", publishedAt: "2025-01-28T03:30:00Z" },
    { id: 702, title: "Star Couple Spotted at Exclusive Restaurant", publishedAt: "2025-01-28T03:00:00Z" },
    { id: 703, title: "Actor's Social Media Post Sparks Speculation", publishedAt: "2025-01-27T24:30:00Z" },
    { id: 704, title: "Celebrity Fashion Choices Make Headlines", publishedAt: "2025-01-27T24:00:00Z" },
    { id: 705, title: "Film Star's Charity Work Gains Recognition", publishedAt: "2025-01-27T23:45:00Z" }
  ],

  andhraNews: [
    { id: 801, title: "Andhra Pradesh Development Initiative Launched", publishedAt: "2025-01-28T02:30:00Z" },
    { id: 802, title: "Regional Trade Fair Attracts Global Participants", publishedAt: "2025-01-28T02:00:00Z" },
    { id: 803, title: "Agricultural Innovation Center Opens in State", publishedAt: "2025-01-27T25:30:00Z" },
    { id: 804, title: "Cultural Heritage Site Receives UNESCO Recognition", publishedAt: "2025-01-27T25:00:00Z" },
    { id: 805, title: "Technology Park Creates Employment Opportunities", publishedAt: "2025-01-27T24:45:00Z" }
  ],

  telanganaNews: [
    { id: 901, title: "Telangana IT Sector Shows Remarkable Growth", publishedAt: "2025-01-28T01:30:00Z" },
    { id: 902, title: "Hyderabad Metro Expansion Project Approved", publishedAt: "2025-01-28T01:00:00Z" },
    { id: 903, title: "State University Launches New Research Programs", publishedAt: "2025-01-27T26:30:00Z" },
    { id: 904, title: "Green Energy Initiative Powers Rural Areas", publishedAt: "2025-01-27T26:00:00Z" },
    { id: 905, title: "Traditional Crafts Festival Celebrates Artisans", publishedAt: "2025-01-27T25:45:00Z" }
  ],

  gossip: [
    { id: 1001, title: "Celebrity Couple's Secret Wedding Revealed", publishedAt: "2025-01-28T00:30:00Z" },
    { id: 1002, title: "Movie Star's Luxury Home Tour Goes Viral", publishedAt: "2025-01-28T00:00:00Z" },
    { id: 1003, title: "Fashion Designer's Exclusive Party Guest List", publishedAt: "2025-01-27T27:30:00Z" },
    { id: 1004, title: "Singer's New Album Recording Session Details", publishedAt: "2025-01-27T27:00:00Z" },
    { id: 1005, title: "TV Personality's Fitness Transformation Journey", publishedAt: "2025-01-27T26:45:00Z" }
  ],

  reviews: [
    { id: 1101, title: "Restaurant Review: New Fusion Cuisine Hotspot", publishedAt: "2025-01-27T23:30:00Z" },
    { id: 1102, title: "Book Review: Bestselling Author's Latest Novel", publishedAt: "2025-01-27T23:00:00Z" },
    { id: 1103, title: "Tech Review: Latest Smartphone Features", publishedAt: "2025-01-27T22:45:00Z" },
    { id: 1104, title: "Travel Review: Hidden Gems in Mountain Region", publishedAt: "2025-01-27T22:15:00Z" },
    { id: 1105, title: "Product Review: Eco-Friendly Home Solutions", publishedAt: "2025-01-27T21:45:00Z" }
  ],

  movieSchedules: [
    { id: 1201, title: "Weekend Box Office Predictions and Schedules", publishedAt: "2025-01-27T22:30:00Z" },
    { id: 1202, title: "New Movie Releases This Week", publishedAt: "2025-01-27T22:00:00Z" },
    { id: 1203, title: "Special Screening Events at Local Theaters", publishedAt: "2025-01-27T21:45:00Z" },
    { id: 1204, title: "Film Festival Schedule and Ticket Information", publishedAt: "2025-01-27T21:15:00Z" },
    { id: 1205, title: "Drive-In Movie Experience Returns to City", publishedAt: "2025-01-27T20:45:00Z" }
  ],

  features: [
    { id: 1301, title: "In-Depth: Climate Change Impact on Agriculture", publishedAt: "2025-01-27T21:30:00Z" },
    { id: 1302, title: "Feature Story: Digital Revolution in Education", publishedAt: "2025-01-27T21:00:00Z" },
    { id: 1303, title: "Investigation: Urban Development Challenges", publishedAt: "2025-01-27T20:45:00Z" },
    { id: 1304, title: "Profile: Young Entrepreneur's Success Journey", publishedAt: "2025-01-27T20:15:00Z" },
    { id: 1305, title: "Analysis: Future of Renewable Energy", publishedAt: "2025-01-27T19:45:00Z" }
  ],

  // Most Popular (with images)
  mostPopular: [
    {
      id: 1401,
      title: "Technology Breakthrough Changes Industry Standards",
      image: "https://images.unsplash.com/photo-1556909114-4ba5e83df467?w=100&h=80&fit=crop",
      publishedAt: "2025-01-27T20:30:00Z"
    },
    {
      id: 1402,
      title: "Sports Victory Inspires Nation's Youth",
      image: "https://images.unsplash.com/photo-1554734867-bf3c00c80de2?w=100&h=80&fit=crop",
      publishedAt: "2025-01-27T19:45:00Z"
    }
  ],

  // Trailers & Teasers data
  trailers: [
    {
      id: 1501,
      title: "Avatar 3: The Next Chapter - Official Trailer",
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=100&h=80&fit=crop",
      type: "Trailer",
      duration: "2:45"
    },
    {
      id: 1502,
      title: "Marvel's Next Phase - Teaser Reveal",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=80&fit=crop",
      type: "Teaser",
      duration: "1:30"
    },
    {
      id: 1503,
      title: "Dune: Part Three - First Look Trailer",
      image: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=100&h=80&fit=crop",
      type: "Trailer",
      duration: "3:12"
    },
    {
      id: 1504,
      title: "Jurassic World: Dominion Continues",
      image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=100&h=80&fit=crop",
      type: "Trailer",
      duration: "2:58"
    },
    {
      id: 1505,
      title: "The Batman Returns - Official Teaser",
      image: "https://images.unsplash.com/photo-1478720568477-b0ffb8430194?w=100&h=80&fit=crop",
      type: "Teaser",
      duration: "1:45"
    }
  ],

  // Education News
  educationNews: [
    { id: 1601, title: "New Digital Learning Platform Transforms Classroom Experience", publishedAt: "2025-01-28T05:30:00Z" },
    { id: 1602, title: "Government Announces Scholarship Program for STEM Students", publishedAt: "2025-01-28T05:00:00Z" },
    { id: 1603, title: "Virtual Reality Technology Enhances Science Education", publishedAt: "2025-01-27T22:30:00Z" },
    { id: 1604, title: "Teacher Training Initiative Focuses on Modern Pedagogy", publishedAt: "2025-01-27T22:00:00Z" },
    { id: 1605, title: "University Research Program Receives International Recognition", publishedAt: "2025-01-27T21:45:00Z" },
    { id: 1606, title: "Online Learning Platforms Show Remarkable Growth", publishedAt: "2025-01-27T21:15:00Z" },
    { id: 1607, title: "Educational Technology Startups Attract Investment", publishedAt: "2025-01-27T20:45:00Z" },
    { id: 1608, title: "School Infrastructure Development Program Launches", publishedAt: "2025-01-27T20:15:00Z" },
    { id: 1609, title: "Student Achievement Scores Reach All-Time High", publishedAt: "2025-01-27T19:45:00Z" },
    { id: 1610, title: "Adult Education Programs Expand Across Rural Areas", publishedAt: "2025-01-27T19:15:00Z" },
    { id: 1611, title: "Career Counseling Services Improve Student Outcomes", publishedAt: "2025-01-27T18:45:00Z" },
    { id: 1612, title: "Educational Exchange Program Strengthens Global Ties", publishedAt: "2025-01-27T18:15:00Z" },
    { id: 1613, title: "Special Needs Education Resources Receive Funding Boost", publishedAt: "2025-01-27T17:45:00Z" },
    { id: 1614, title: "Coding Bootcamps Bridge Skills Gap in Tech Industry", publishedAt: "2025-01-27T17:15:00Z" },
    { id: 1615, title: "Educational Assessment Methods Undergo Major Reform", publishedAt: "2025-01-27T16:45:00Z" }
  ],

  // Actors and Actresses data for Events section
  actorsActresses: [
    {
      id: 1601,
      name: "Ryan Gosling",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1602,
      name: "Emma Stone",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1603,
      name: "Michael B. Jordan",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1604,
      name: "Margot Robbie",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1605,
      name: "Timothée Chalamet",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1606,
      name: "Zendaya",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1607,
      name: "Oscar Isaac",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1608,
      name: "Lupita Nyong'o",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1609,
      name: "Adam Driver",
      image: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1610,
      name: "Saoirse Ronan",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1611,
      name: "John Boyega",
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1612,
      name: "Anya Taylor-Joy",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1613,
      name: "LaKeith Stanfield",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=200&fit=crop",
      category: "Actor"
    },
    {
      id: 1614,
      name: "Florence Pugh",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=200&fit=crop",
      category: "Actress"
    },
    {
      id: 1615,
      name: "Dev Patel",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=200&fit=crop",
      category: "Actor"
    }
  ],

  // Gallery Photos - Expanded dataset for Gallery page with categories: Actors, Actresses, Top Pics, Events
  galleryPhotos: [
    // Actors Gallery - Based on June 30, 2026 reference date
    // Today's photos
    {
      id: 2001,
      title: "Ryan Gosling at Movie Premiere Red Carpet",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-30T10:00:00Z').toISOString(),
      category: "Actors",
      photographer: "Celebrity Photos",
      summary: "Hollywood star Ryan Gosling makes a stunning appearance at the premiere of his latest blockbuster film."
    },
    {
      id: 2002,
      title: "Michael B. Jordan Behind the Scenes Action Shot",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-30T15:30:00Z').toISOString(),
      category: "Actors",
      photographer: "Set Photography",
      summary: "Exclusive behind-the-scenes photo of Michael B. Jordan during intense action sequence filming."
    },

    // Actresses Gallery
    {
      id: 2003,
      title: "Emma Stone Elegant Award Show Portrait",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-29T11:15:00Z').toISOString(),
      category: "Actresses",
      photographer: "Awards Photography",
      summary: "Academy Award winner Emma Stone radiates elegance at the prestigious film awards ceremony."
    },
    {
      id: 2004,
      title: "Zendaya Fashion Magazine Cover Shoot",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-29T17:45:00Z').toISOString(),
      category: "Actresses",
      photographer: "Fashion Studio",
      summary: "Multi-talented star Zendaya showcases stunning fashion looks for major magazine cover story."
    },

    // Top Pics - Instagram-style content
    {
      id: 2005,
      title: "Breathtaking Sunset Over Mountain Range",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-28T12:20:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Nature Photography",
      summary: "Spectacular sunset captures golden hour magic over majestic mountain landscape."
    },
    {
      id: 2006,
      title: "Urban Architecture Meets Modern Art",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-27T14:45:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Urban Explorer",
      summary: "Contemporary architectural photography showcasing the intersection of design and artistic expression."
    },

    // Events Gallery
    {
      id: 2007,
      title: "Film Festival Opening Ceremony Highlights",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-26T09:30:00Z').toISOString(),
      category: "Events",
      photographer: "Event Photography",
      summary: "Glamorous opening ceremony of international film festival brings together industry luminaries."
    },
    {
      id: 2008,
      title: "Celebrity Charity Gala Red Carpet Moments",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-25T16:15:00Z').toISOString(),
      category: "Events",
      photographer: "Red Carpet Media",
      summary: "Stars gather for annual charity gala supporting important humanitarian causes worldwide."
    },

    // More Actors (This week)
    {
      id: 2009,
      title: "Timothée Chalamet Artistic Portrait Session",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-24T13:00:00Z').toISOString(),
      category: "Actors",
      photographer: "Portrait Studio",
      summary: "Acclaimed young actor Timothée Chalamet in contemplative artistic portrait capturing his creative essence."
    },

    // More Actresses (Last 7-14 days)
    {
      id: 2010,
      title: "Margot Robbie Movie Set Candid Moment",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-22T11:30:00Z').toISOString(),
      category: "Actresses",
      photographer: "Set Photography",
      summary: "Candid behind-the-scenes moment of Margot Robbie during break in filming major studio production."
    },
    {
      id: 2011,
      title: "Lupita Nyong'o International Film Festival",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-20T15:15:00Z').toISOString(),
      category: "Actresses",
      photographer: "Festival Media",
      summary: "Academy Award winner Lupita Nyong'o graces international film festival with powerful screen presence."
    },

    // More Top Pics (Last 7-14 days)
    {
      id: 2012,
      title: "Ocean Waves Crash Against Rocky Coastline",
      image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-18T10:45:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Coastal Photography",
      summary: "Dynamic seascape capturing the raw power and beauty of ocean waves meeting rugged coastline."
    },
    {
      id: 2013,
      title: "Vibrant Street Art Transforms City Wall",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-15T17:30:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Street Art Collective",
      summary: "Colorful mural brings life and energy to urban landscape through bold artistic expression."
    },

    // More Events (Last 30 days)
    {
      id: 2014,
      title: "Awards Season After-Party Exclusive Access",
      image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-05T12:20:00Z').toISOString(),
      category: "Events",
      photographer: "Exclusive Events",
      summary: "Inside look at exclusive after-party following major awards ceremony with industry celebrations."
    },
    {
      id: 2015,
      title: "Movie Premiere Night Fan Excitement",
      image: "https://images.unsplash.com/photo-1489599112477-990c2cb2c508?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-06-02T15:45:00Z').toISOString(),
      category: "Events",
      photographer: "Premiere Coverage",
      summary: "Fans gather in excitement for highly anticipated movie premiere creating electric atmosphere."
    },

    // Additional content for Last 3 months
    {
      id: 2016,
      title: "Oscar Isaac Character Study Portrait",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-05-16T14:30:00Z').toISOString(),
      category: "Actors",
      photographer: "Character Photography",
      summary: "Versatile actor Oscar Isaac captured in powerful character study showcasing dramatic range."
    },
    {
      id: 2017,
      title: "Saoirse Ronan Period Drama Costume Fitting",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-05-01T11:15:00Z').toISOString(),
      category: "Actresses",
      photographer: "Costume Department",
      summary: "Academy Award nominee Saoirse Ronan in elaborate period costume for upcoming historical drama."
    },
    {
      id: 2018,
      title: "Golden Hour Forest Path Adventure",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-04-16T16:45:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Adventure Photography",
      summary: "Enchanting forest path bathed in golden hour light creates magical natural corridor."
    },
    {
      id: 2019,
      title: "Industry Roundtable Discussion Panel",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-04-06T13:20:00Z').toISOString(),
      category: "Events",
      photographer: "Industry Events",
      summary: "Leading filmmakers and actors participate in important industry discussion about future of cinema."
    },

    // Additional content for Last 6 months  
    {
      id: 2020,
      title: "Adam Driver Independent Film Portrait",
      image: "https://images.unsplash.com/photo-1519764622345-23439dd774f7?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-03-02T10:30:00Z').toISOString(),
      category: "Actors",
      photographer: "Independent Cinema",
      summary: "Acclaimed actor Adam Driver in contemplative portrait for upcoming independent film project."
    },
    {
      id: 2021,
      title: "Anya Taylor-Joy Fashion Week Front Row",
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-02-01T12:45:00Z').toISOString(),
      category: "Actresses",
      photographer: "Fashion Week",
      summary: "Rising star Anya Taylor-Joy attends prestigious fashion week show showcasing latest designer collections."
    },
    {
      id: 2022,
      title: "Desert Landscape Minimalist Composition",
      image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-01-12T15:20:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Landscape Photography",
      summary: "Minimalist desert landscape showcasing the stark beauty and endless horizons of arid regions."
    },
    {
      id: 2023,
      title: "Film Critics Choice Awards Ceremony",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      publishedAt: new Date('2026-01-12T15:20:00Z').toISOString(),
      category: "Events",
      photographer: "Awards Photography",
      summary: "Annual Critics Choice Awards ceremony celebrates outstanding achievements in cinema and television."
    },

    // Additional content for Last year
    {
      id: 2024,
      title: "John Boyega Action Hero Training Session",
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=300&h=400&fit=crop",
      publishedAt: new Date('2025-11-03T17:00:00Z').toISOString(),
      category: "Actors",
      photographer: "Training Photography",
      summary: "Star Wars actor John Boyega undergoes intensive training for upcoming action hero role preparation."
    },
    {
      id: 2025,
      title: "Florence Pugh Breakthrough Performance Stills",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop",
      publishedAt: new Date('2025-09-04T14:15:00Z').toISOString(),
      category: "Actresses",
      photographer: "Performance Photography",
      summary: "Breakout star Florence Pugh delivers powerful performance captured in striking film stills."
    },
    {
      id: 2026,
      title: "Northern Lights Aurora Spectacular Display",
      image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&h=400&fit=crop",
      publishedAt: new Date('2025-08-05T11:30:00Z').toISOString(),
      category: "Top Pics",
      photographer: "Aurora Photography",
      summary: "Breathtaking aurora borealis display creates natural light show across northern sky."
    },
    {
      id: 2027,
      title: "Cannes Film Festival Closing Ceremony",
      image: "https://images.unsplash.com/photo-1549451371-64aa98a6f632?w=300&h=400&fit=crop",
      publishedAt: new Date('2025-07-16T16:45:00Z').toISOString(),
      category: "Events",
      photographer: "Festival Coverage",
      summary: "Grand finale of prestigious Cannes Film Festival celebrates international cinema achievements."
    },
    {
      id: 2028,
      title: "Dev Patel Director Debut Behind Scenes",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop",
      publishedAt: new Date('2025-07-06T13:00:00Z').toISOString(),
      category: "Actors",
      photographer: "Director Photography",
      summary: "Acclaimed actor Dev Patel steps behind camera for directorial debut capturing creative process."
    }
  ]
};

export default mockData;