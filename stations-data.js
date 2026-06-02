// stations-data.js — single source of truth for all BlackBuddaFM station data
// Track entries use plain objects {title, note} — rendering is the component's job

const STATIONS = [
  {
    freq: 88.9,
    epNum: "01",
    genre: "JUNGLE",
    title: "EP 01 \u2013 JUNGLE: ORIGINAL NUTTAH SHOCKWAVE",
    subtitle: "THE ROOTS OF THE BREAKBEAT",
    desc: "Enter the era when London\u2019s illegal warehouse raves mutated into a darker, breakneck sound born from the concrete. This opening chapter traces jungle\u2019s explosive rise from 1991\u20131993, where chopped breaks met deep sub-bass and Caribbean sound system culture. Lock your frequency and stay tuned to the underground pulse.",
    duration1: "52:14",
    duration2: "35:20",
    bitrate: "320 KBPS",
    location: "JUNGLE CLANDESTINE HQ",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    colors: {
      neonPink: "#ff6600",
      neonGreen: "#ffcc00",
      surfaceLowest: "#0e0d0a",
      surfaceLow: "#1c1b18"
    },
    vinylImg: "https://images.unsplash.com/photo-1539625319135-882b8340c1d6?q=80&w=400&auto=format&fit=crop",
    cardImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6lGGSPZGaVWzarUhkinA7DMgTL7LVqQ2p6hVxpwaDEKKpIhabhUMekM3nThhPZ-6Eny95LqzBEDrH4cPWDsIELcrQMZALzWSI1vmEMzowNwWydnIJizqrMNZ2kI9kDomuDPFdc9iq4LjrX_nD9bXiwhzXOZ5r9yq-XeAgV2zTnSfCXqO9pkAKAFPU-tYW3n2lCC7TRzDFykbj5Xd8mKegd5CJfoeynCYgMEyesdbRWAxXhm3ABvfOoPZdZ06IQZBEVCwL3cs",
    cardDate: "11.10.25",
    cardEp: "EP 01 / SYSTEM",
    tracks1: [
      { title: "Lennie De Ice \u2013 We Are I.E. (1991)", note: "The ultimate sonic bridge; unites bleep techno with heavy sub-bass and accelerated breakbeats." },
      { title: "SL2 \u2013 On A Ragga Tip (1992)", note: "Collides UK rave with Jamaican sound system culture, establishing the foundational ragga jungle blueprint." },
      { title: "Rufige Kru \u2013 Terminator (1992)", note: "Pioneers time-stretching on drum breaks to birth the metallic, moody darkcore aesthetic." },
      { title: "Origin Unknown \u2013 Valley of the Shadows (1993)", note: "Perfects atmospheric early jungle, balancing a legendary vocal sample with sweeping, sci-fi production." },
      { title: "Omni Trio \u2013 Renegade Snares (Foul Play Remix) (1993)", note: "Elevates the breakbeat from a rhythmic backing track into a complex, chopped lead instrument." },
      { title: "DJ Crystl \u2013 Warpdrive (1993)", note: "Captures the futuristic, intelligent pirate radio energy just before the underground exploded." }
    ],
    tracks2: [
      { title: "UK Apachi with Shy FX \u2013 Original Nuttah (1994)", note: "The ultimate crossover anthem; exports raw ragga jungle from the underground into the national charts." },
      { title: "M-Beat feat. General Levy \u2013 Incredible (1994)", note: "The commercial peak of ragga jungle that triggered an underground backlash and a deeper sonic shift." },
      { title: "Goldie \u2013 Inner City Life (1994)", note: "A lush, emotional masterpiece proving the genre belonged on full-length LPs, not just dancefloor 12-inches." },
      { title: "Roni Size \u2013 Music Box (1995)", note: "Unveils the rolling Bristol sound, driving sophisticated jazz double-bass licks to the forefront." },
      { title: "Alex Reece \u2013 Pulp Fiction (1995)", note: "Strips away chaotic breakbeats for a clean, driving two-step rhythm, piloting modern drum and bass." },
      { title: "DJ Trace \u2013 Mutant Revisited (1995)", note: "Birth of tech-step; deploys cold, dystopian Reese basslines to signal a dark new era." }
    ]
  },
  {
    freq: 91.2,
    epNum: "02",
    genre: "DRUM & BASS",
    title: "EP 02 \u2013 DRUM & BASS: SYMPHONIES IN THE SUB",
    subtitle: "THE ART OF THE ROLLING BREAKBEAT",
    desc: "Witness the rave retreat underground as late-90s jungle mutates into the sleek machine pressure of drum & bass. Relentless two-step rhythms and snarling tech-step basslines redefine the sound of the city. Hold the frequency and stay locked to the heartbeat of the streets.",
    duration1: "59:08",
    duration2: "40:15",
    duration3: "45:30",
    bitrate: "320 KBPS",
    location: "METROPOLIS ARCHES",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    trackUrl3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    colors: {
      neonPink: "#ff003c",
      neonGreen: "#00ffff",
      surfaceLowest: "#0f0a0a",
      surfaceLow: "#1d1919"
    },
    vinylImg: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "28.11.25",
    cardEp: "EP 02 / MOTION",
    tracks1: [
      { title: "Adam F \u2013 Circles (1997)", note: "Fuses atmospheric jungle roots with precise D&B engineering using a rolling jazz sample." },
      { title: "Roni Size / Reprazent \u2013 Brown Paper Bag (1997)", note: "Brings live acoustic instrumentation to D&B, securing a historic Mercury Prize for the scene." },
      { title: "Ed Rush, Optical & Fierce \u2013 Alien Girl (1998)", note: "The definitive neurofunk blueprint; introduces heavy, mechanical, undulating Reese basslines." },
      { title: "Bad Company UK \u2013 The Nine (1998)", note: "Stripped of all melody; stands as the absolute pinnacle of underground groove and dancefloor engineering." },
      { title: "Dillinja \u2013 Hard Noize (1998)", note: "Peak tear-out sound; saturated sub-bass engineered to push heavy club hardware to its breaking point." },
      { title: "Micky Finn & Aphrodite \u2013 Bad Ass (1996)", note: "Laid the rowdy blueprint for early jump-up with bouncy beats and massive hip-hop sampling." }
    ],
    tracks2: [
      { title: "Shy FX & T Power \u2013 Shake Ur Body (2001)", note: "Defies brooding underground rules to score an inescapable daytime radio and pop chart hit." },
      { title: "High Contrast \u2013 Racing Green (2004)", note: "The quintessential liquid anthem; fires up lush soul and disco influences at a rolling 170 BPM." },
      { title: "Pendulum \u2013 Tarantula (2005)", note: "Deploys massive rock-band energy and synth leads to rip D&B out of clubs onto global festival stages." },
      { title: "DJ Hazard & D Minds \u2013 Mr Happy (2007)", note: "An inescapable jump-up phenomenon; its screeching, modulating bassline completely dominated the clubs." },
      { title: "Chase & Status \u2013 No Problem (2011)", note: "Blends hyper-aggressive modern production with tribal and reggae energy for stadium-level dominance." },
      { title: "DJ Zinc \u2013 138 Trek (1999)", note: "A chronological pivot; drops the tempo to 138 BPM and accidentally bridges D&B to early garage." }
    ],
    tracks3: [
      { title: "Noisia & The Upbeats \u2013 Dead Limit (2015)", note: "The peak of modern electronic sound design, pushing neurofunk to hyper-detailed extremes." },
      { title: "Dimension & Sub Focus \u2013 Desire (2018)", note: "A stadium-sized masterclass in cinematic, emotional festival D&B for the global stage." },
      { title: "Hedex \u2013 MHITR (Semi-Automatic) (2023)", note: "Violently catchy modern jump-up designed for the social media age and a new generation of ravers." },
      { title: "Nia Archives \u2013 Baian\u00e1 (2022)", note: "Ignites the modern DIY jungle revival, pairing live vocals with raw, classic chopped breaks." },
      { title: "venbee, goddard. \u2013 messy in heaven (2022)", note: "Pairs personal singer-songwriter vocals with heavy liquid rollers to conquer the UK Top 40." },
      { title: "Chase & Status feat. Bou \u2013 Baddadan (2023)", note: "A heavy, definitive decade-defining roller bridging sound system roots with hyper-modern production." }
    ]
  },
  {
    freq: 93.5,
    epNum: "03",
    genre: "UK GARAGE",
    title: "EP 03 \u2013 UK GARAGE & 2-STEP: THE CHAMPAGNE SHUFFLE",
    subtitle: "2 STEP & NIGHT BUS ANTHEMS",
    desc: "Step into the late-90s Sunday club scene where UK Garage brought soul, swagger, and designer style to the underground. At 130 BPM, producers fused house, sub-bass, and chopped vocals into the unmistakable swing of 2-step. Tune the system and stay locked to this syncopated lineage.",
    duration1: "42:17",
    duration2: "38:40",
    bitrate: "320 KBPS",
    location: "BLACK BUDDHA HQ",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    colors: {
      neonPink: "#ff00ff",
      neonGreen: "#a1fb00",
      surfaceLowest: "#0e0e0e",
      surfaceLow: "#1c1b1b"
    },
    vinylImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_wEXSaYe5BZlrbBz85FsiQPhXYuNmtsceeT8911HmmvBcYb70OvO05QR6z0iBcVhFC6BkaeY2rkmdWMmtTiP4_60J5CEXvMFVrO7gTG5ElV40pvpCdtt_gDmDP4XJVZHxNlLfB2ybldd71gezzBsalGNrMCebFuNSHxa3bAb7zzqBKPJHhtFLQPRys7jCtHasO0X8SDn0yStshoHpgrUatItDnucGtsFMBk44IN_eo9QVEXRlITTyCRXFvREzsoIfs7OgEhHu5qQ",
    cardImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIKRABW_9JptrXoEh_5mSkw0MBe0LQnwxz_BFfI6w5nfU1yr19vI5squNltxEUFb08aWvXIeLD84k1vqOslmab4n41jrHDsBi0qM5GEuag_YWBZASUSFqoVnOC99Pt-U5NcaAMqmrjgvIAS7997liYOQgk4sr0gLwCbXxzZNapxLBwqKYKwn2M9XS75w7oBbYyWlRXjumGZKPqeh32HexhB9U2kHLHu1RbDYhu84tPTp9XTxTywobXWnoVXl_j47h33t3YZvbrbtQ",
    cardDate: "04.12.25",
    cardEp: "EP 03 / SOUTH",
    tracks1: [
      { title: "Roy Davis Jr. ft. Peven Everett \u2013 Gabriel (Live Garage Mix) (1996)", note: "The foundational US-born blueprint that gave the UK scene a soulful escape from frantic breakbeats." },
      { title: "Tina Moore \u2013 Never Gonna Let You Go (Kelly G Bump-N-Go Dub) (1997)", note: "Syncopated vocal remix style that defined and maximized dancefloor swing for glamorous Sunday club nights." },
      { title: "Todd Edwards \u2013 Saved My Life (1995)", note: "Micro-chops vocals into rhythmic, percussive melodies, creating the absolute signature UKG production style." },
      { title: "Double 99 \u2013 Ripgroove (1997)", note: "The heavy speed garage template; weaponizes a 4x4 house beat with time-stretched vocal samples and jungle sub-bass." },
      { title: "Tuff Jam \u2013 Need Good Love (1997)", note: "The quintessential 4x4 champagne-era sound, packed with infectious swing and aspirational Sunday club energy." },
      { title: "MJ Cole \u2013 Sincere (1998)", note: "A broken, syncopated masterclass that removed the standard second and fourth kick drums to birth 2-step." },
      { title: "Shanks & Bigfoot \u2013 Sweet Like Chocolate (1999)", note: "Broke out of the underground to hit number one, cementing garage as a daytime radio pop phenomenon." },
      { title: "Sweet Female Attitude \u2013 Flowers (Sunship Mix) (2000)", note: "The definitive emotional peak, demonstrating that garage could carry deep, heartfelt soulful expression." }
    ],
    tracks2: [
      { title: "Artful Dodger \u2013 Re-Rewind (1999)", note: "A massive transatlantic anthem that shifted garage from underground to national pop phenomenon." },
      { title: "DJ Luck & MC Neat \u2013 A Little Bit of Luck (1999)", note: "The perfect MC-led anthem; establishes the classic DJ-MC pairing that defined the next decade of UK club music." },
      { title: "Wookie \u2013 Battle (2000)", note: "An irresistible fusion of deep house spirituality and UK garage syncopation, totally unique in its class." },
      { title: "Private / Zed Bias \u2013 Neighbourhood (2000)", note: "A moodier, deeper sound that signals the underground\u2019s natural evolution and the beginning of proto-grime." },
      { title: "Sticky ft. Ms. Dynamite \u2013 Booo! (2001)", note: "A feminist declaration and street landmark; Ms. Dynamite\u2019s raw lyricism reshapes the MC\u2019s cultural role." },
      { title: "Oxide & Neutrino \u2013 Bound 4 Da Reload (Casualty) (2000)", note: "Completely stripped-back production; this is the raw pirate radio anthem that bridges garage directly into grime." },
      { title: "So Solid Crew \u2013 21 Seconds (2001)", note: "A generation-defining chart-topper; gives 21 solo voices 21 seconds each, the purest distillation of collective power." },
      { title: "Pay As U Go Cartel \u2013 Champagne Dance (2001)", note: "An essential crew anthem bridging the gap between garage\u2019s champagne-era glamour and the raw energy of nascent grime." }
    ]
  },
  {
    freq: 95.8,
    epNum: "04",
    genre: "GRIME",
    title: "EP 04 \u2013 GRIME: ESKIMO ICE AGE",
    subtitle: "8-BAR BEATS & RAW STREET POETRY",
    desc: "Enter East London in 2002 as a new generation builds a colder, harder sound from the concrete up. Garage is stripped back into icy synths, sharp 8-bar rhythms, and pirate radio clashes. Lock in the dial and stay tuned to the raw underground pulse.",
    duration1: "38:45",
    duration2: "35:10",
    duration3: "32:15",
    bitrate: "320 KBPS",
    location: "ROOFTOP TRANSMITTER 14",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    trackUrl3: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    colors: {
      neonPink: "#B0B7C3",
      neonGreen: "#ffffff",
      surfaceLowest: "#0d0d0c",
      surfaceLow: "#1c1c1a"
    },
    vinylImg: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    cardImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCirJv0ziKZIxHGN9mP0i-0yTNHzmOsRTyEPw8UGYX0SGrtMKUspKBzoEbvO_a7wvKUPVlBolOOjIqpquq8fF4ypo1wurA2cVJ-Ql_FdaG8nKsQceePseWEtHJ0Mydj9pPHaCkH71OX0wCg2Kd2fICz-0lzoe4aQXqW5j87Z_U2tBhpXxZMnn_HP_UAOPoWMBVTcMgMgSUQKOYS5rbaXElP4TvgQ_N_dkCrd8QrJKFCmglyW_zPiALdY5x0ZIGyku_5FeIc6DgwZ28",
    cardDate: "28.11.25",
    cardEp: "EP 04 / SKYLINE",
    tracks1: [
      { title: "Wiley \u2013 Eskimo (2002)", note: "The blueprint. Icy synths, stuttering rhythms and minimalist production define grime\u2019s foundational sound." },
      { title: "Wiley \u2013 Igloo (2003)", note: "Perfects the Eskimo Beat sound; an Arctic digital landscape that launched an entire scene." },
      { title: "Musical Mob \u2013 Pulse X (2002)", note: "The undetonated original; considered the first true grime instrumental recorded." },
      { title: "Dizzee Rascal \u2013 I Luv U (2003)", note: "Rascal\u2019s ferocious, complex debut; sets a whole new bar for lyrical complexity and aggression in UK music." },
      { title: "Roll Deep \u2013 Terrible (2003)", note: "The defining collective anthem; showcases Roll Deep\u2019s staggering lyrical depth and crew unity." },
      { title: "Lethal Bizzle \u2013 Pow (Forward) (2004)", note: "A violent, anarchic club phenomenon; its uncontrollable energy got it banned from multiple venues." },
      { title: "Kano \u2013 P\u2019s & Q\u2019s (2004)", note: "Kano\u2019s definitive arrival; connects raw street poetry with elevated artistry and mainstream potential." },
      { title: "Ruff Sqwad \u2013 Functions on the Low (2004)", note: "A deeply melancholic yet hard-edged classic; cinematic emotionalism meets raw grime production." }
    ],
    tracks2: [
      { title: "Jme \u2013 Serious (2006)", note: "The Boy Better Know aesthetic crystallised; uncompromising, dry, and sharply self-aware." },
      { title: "Tempa T \u2013 Next Hype (2009)", note: "Pure, unfiltered aggression as an art form; became one of the genre\u2019s greatest viral anthems." },
      { title: "Meridian Dan \u2013 German Whip (2014)", note: "The unexpected resurrection; a stripped-back, deadpan banger that reignited the mainstream\u2019s interest in grime." },
      { title: "Skepta ft. Jme \u2013 That\u2019s Not Me (2014)", note: "The manifesto of a generation refusing to compromise; the catalyst for grime\u2019s global renaissance." },
      { title: "Stormzy \u2013 Shut Up (2015)", note: "Pure disdain as a masterpiece; became a UK chart phenomenon through an unstoppable internet campaign." },
      { title: "Skepta \u2013 Shutdown (2015)", note: "The ultimate peak of Boy Better Know\u2019s movement; a genre-defining, generation-rallying anthem." },
      { title: "Kano \u2013 3 Wheel-ups (2016)", note: "Effortlessly bridges street credibility and sophisticated artistry; the most celebrated MC/actor of his generation." }
    ],
    tracks3: [
      { title: "Stormzy \u2013 Big For Your Boots (2017)", note: "Commanding mainstream dominance while staying firmly rooted in grime\u2019s confrontational values." },
      { title: "Dave & AJ Tracey \u2013 Thiago Silva (2016)", note: "A future grime legend is born; an effortlessly detailed lyrical showcase demanding a major record deal." },
      { title: "Ghetts ft. Skepta \u2013 IC3 (2020)", note: "A landmark collaboration; two legends at their absolute peak delivering one of grime\u2019s finest moments." },
      { title: "D Double E ft. Kano \u2013 Tell Me A Ting (2019)", note: "Veteran excellence personified; a masterclass in controlled aggression and earned authority." },
      { title: "Kano ft. D Double E & Ghetts \u2013 Class of Deja (2019)", note: "A reunion of unparalleled significance; the three founding MCs reunite on Kano\u2019s critically acclaimed HBO show." },
      { title: "Manga Saint Hilare \u2013 That\u2019s How We Like It (2020)", note: "Underground authenticity preserved; Manga rejects all commercial compromise to deliver relentless, complex bars." }
    ]
  },
  {
    freq: 98.1,
    epNum: "05",
    genre: "DUBSTEP",
    title: "EP 05 \u2013 DUBSTEP: SOUTH OF THE RIVER SHADOWS",
    subtitle: "SUB-LOW FREQUENCIES & HALF-TIME BEATS",
    desc: "Travel to early-2000s Croydon where a quiet revolution reshaped underground bass music forever. Sparse rhythms and deep half-step basslines create a dark, meditative sound built to shake the floorboards. Dial in and keep the system locked to the deep underground.",
    duration1: "48:32",
    duration2: "32:45",
    bitrate: "320 KBPS",
    location: "SUB-TEMPLE SOUTH",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    colors: {
      neonPink: "#9b30ff",
      neonGreen: "#00ffcc",
      surfaceLowest: "#0a0d0e",
      surfaceLow: "#181a1c"
    },
    vinylImg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    cardImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOwDLoxm9p14JPUUMXX_Y8MlLrIHZ-sMjZj7rdpUpzNmuL4KnSfcFAajbEAdRgJkXQLIzdsEe3H-3eyKZBOy1dURGGK2eKsGzbDt6LyJ0wUP-sgRnwksSQ0stmJ3BT7XuPNjOlzDHRJOChmLA0YkAFdMtp4HIFyYRv2Dq4nXOQVDurXvOppxvN_BaBVrlHSFKoTyVm9xLOsr3E6ekoVpLowGVzotKLAizkQ1KMIddUUsFBGy4DEdqFxYitWXKVIiX46xEEv10gz_c",
    cardDate: "15.12.25",
    cardEp: "EP 05 / SUB LOW",
    tracks1: [
      { title: "El-B \u2013 Buck & Bury (2001)", note: "The proto-dubstep prototype; combines broken garage rhythms with an impossibly deep, rattling sub-bass." },
      { title: "Benga & Skream \u2013 The Judgement (2003)", note: "An early Rinse FM pirate radio recording that captures the nascent south London scene at its most raw." },
      { title: "Digital Mystikz \u2013 Haunted (2005)", note: "Pure atmospheric dread; DMZ\u2019s defining sound of dark, spacious, meditative sub-bass pressure." },
      { title: "Loefah \u2013 Mud (2006)", note: "Industrial grade weight; Loefah\u2019s bass hits like concrete, defining the most brutal end of the DMZ sound." },
      { title: "Skream \u2013 Midnight Request Line (2005)", note: "A transcendent dubstep classic; melodic enough for the charts, dark enough for the underground." },
      { title: "Burial \u2013 Archangel (2007)", note: "A genre-defining masterpiece; street-level melancholy and urban solitude given perfect musical form." }
    ],
    tracks2: [
      { title: "Benga & Coki \u2013 Night (2008)", note: "The explosive transition moment; bridges underground DMZ experimentalism with high-energy rave culture." },
      { title: "Rusko \u2013 Cockney Thug (2007)", note: "Where dubstep goes brostep; aggressive wobble bass designed for maximum dancefloor carnage." },
      { title: "Magnetic Man \u2013 I Need Air (2010)", note: "The mainstream summit; three dubstep titans combine to deliver a chart-friendly, emotionally resonant anthem." },
      { title: "La Roux \u2013 In For The Kill (Skream Remix) (2009)", note: "The crossover that changed everything; makes dubstep's wobble bass a global pop production tool." },
      { title: "Katy B \u2013 Katy On A Mission (2010)", note: "A defining cultural moment; the perfect marriage of garage-rave energy and modern dubstep production." },
      { title: "Joy Orbison \u2013 Hyph Mngo (2009)", note: "A beautiful, melancholic anomaly; brings genuine emotional depth and restraint back to the bass underground." },
      { title: "James Blake \u2013 CMYK (2010)", note: "Post-dubstep\u2019s artistic peak; dismantles the genre\u2019s aggression entirely, leaving only raw emotional space." }
    ]
  },
  {
    freq: 100.4,
    epNum: "06",
    genre: "BASSLINE",
    title: "EP 06 \u2013 BASSLINE & NICHE: UP THE M1 MOTORWAY",
    subtitle: "UP THE M1 MOTORWAY",
    desc: "Head north as Yorkshire and the Midlands flip garage into a faster, louder club rebellion. Sweet R&B vocals collide with sharp 4x4 rhythms and wild mid-range bass pressure. Tune the system and stay locked to the rhythm of the North.",
    duration1: "45:30",
    duration2: "31:15",
    bitrate: "320 KBPS",
    location: "NICHE CLUB SHEFFIELD",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    colors: {
      neonPink: "#FF2DAA",
      neonGreen: "#ffff00",
      surfaceLowest: "#0e0a0d",
      surfaceLow: "#1c181b"
    },
    vinylImg: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "08.01.26",
    cardEp: "EP 06 / NORTH",
    tracks1: [
      { title: "Agent X \u2013 Decoy (2003)", note: "The skeleton key; unleashes a sharp, mid-range squelch bassline that defines Sheffield\u2019s raw underground sound." },
      { title: "Booda ft. Richard O \u2013 Niche Anthem (2003)", note: "The definitive declaration; names the club, names the sound, names a generation of northern ravers." },
      { title: "TRC \u2013 Oo Aa Ee (2005)", note: "Maximal northern energy; sweet female vocals collide with a distorted, mid-heavy bassline for pure dancefloor carnage." },
      { title: "Delinquent ft. Kcat \u2013 My Destiny (2006)", note: "The emotional peak of the genre; a bittersweet R&B vocal elevated by heavyweight Yorkshire bass pressure." },
      { title: "TS7 \u2013 Bradford (2007)", note: "The Bradford anthem; raw, unfiltered regional pride delivered over a relentlessly bouncing 4x4 rhythm." },
      { title: "DJ Q \u2013 The Original (2004)", note: "The title says it all; DJ Q crystallises the original, purist bassline house sound with expert precision." }
    ],
    tracks2: [
      { title: "T2 ft. Jodie \u2013 Heartbroken (2007)", note: "Crossover gold; an irresistible, emotionally direct anthem that carried bassline into the national mainstream." },
      { title: "H \u201cTwo\u201d O ft. Platnum \u2013 What\u2019s It Gonna Be (2008)", note: "The chart breakthrough that proved bassline\u2019s pop potential, despite the underground\u2019s fierce resistance." },
      { title: "DJ Q ft. MC Bonez \u2013 You Wot! (2007)", note: "The ultimate MC-led bassline anthem; raw energy and unmistakable northern accent define a scene\u2019s voice." },
      { title: "Danny Bond \u2013 The Pipe (2008)", note: "Pure, mechanical aggression; a monster sub-bass workout built for maximum system pressure and dancefloor dominance." },
      { title: "Wideboys \u2013 Sambuca (Bassline Mix) (2008)", note: "The London connection; West London producers make an unlikely, successful pilgrimage up the M1 motorway." },
      { title: "Crazy Cousinz \u2013 Bongo Jam (2008)", note: "A crucial transitional record that connects bassline\u2019s northern energy directly to London\u2019s emerging UK Funky movement." }
    ]
  },
  {
    freq: 102.7,
    epNum: "07",
    genre: "UK FUNKY",
    title: "EP 07 \u2013 UK FUNKY: THE TRIBAL SHIFT",
    subtitle: "SOCA PERCUSSION & EUPHORIC VOCALS",
    desc: "Feel warmth return to the underground as London swaps darkness for movement and celebration. Soulful house blends with syncopated African percussion to create a fresh new bounce. Lock in the dial and keep the sound system tuned to the evolution.",
    duration1: "50:11",
    duration2: "34:50",
    bitrate: "320 KBPS",
    location: "SOULSHINE STUDIO SW",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    colors: {
      neonPink: "#FF6B1A",
      neonGreen: "#39ff14",
      surfaceLowest: "#0a0e0a",
      surfaceLow: "#181c18"
    },
    vinylImg: "https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "19.01.26",
    cardEp: "EP 07 / TRIBAL",
    tracks1: [
      { title: "Fish Go Deep \u2013 The Cure & The Cause (Dennis Ferrer Remix) (2006)", note: "The deep house foundation stone; African percussion and soulful chords establish the genre\u2019s warm blueprint." },
      { title: "Apple \u2013 Mr Choc (2007)", note: "An early UK Funky cornerstone; percussive, driving and deceptively sparse." },
      { title: "Crazy Cousinz \u2013 Bongo Jam (2008)", note: "The crucial bridge; transitions bassline\u2019s northern energy directly into London\u2019s emerging tribal house scene." },
      { title: "Princess Nyah \u2013 Frontline (Ill Blu Remix) (2008)", note: "Euphoric female vocals over complex tribal rhythms; the perfect encapsulation of UK Funky\u2019s celebratory spirit." },
      { title: "Lil Silva \u2013 Seasons (2008)", note: "A deeply atmospheric, melancholic counterpoint; proves the genre can carry complex emotional weight." },
      { title: "Roska \u2013 Squark (2009)", note: "Raw percussive energy at its finest; Roska\u2019s production is stripped back, organic and physically irresistible." },
      { title: "Marcus Nasty & Macabre Unit \u2013 Funky Monkey (2009)", note: "The pirate radio anthem; raw, unapologetic and perfectly calibrated for illegal Rinse FM transmission." },
      { title: "Donae\u2019o \u2013 Party Hard (2009)", note: "The crossover moment; UK Funky\u2019s irresistible rhythmic bounce breaks out of the underground and into clubs nationwide." }
    ],
    tracks2: [
      { title: "Egypt \u2013 In The Morning (2009)", note: "Sophisticated soulful vocals over a complex, multi-layered percussion groove that rewards repeated listens." },
      { title: "Gracious K \u2013 Migraine Skank (2009)", note: "A ridiculous, joyful viral phenomenon; the migraine skank dance move transcends the underground entirely." },
      { title: "K.I.G \u2013 Head, Shoulders, Kneez & Toez (2009)", note: "Novelty song to national phenomenon; an irresistible earworm that introduced UK Funky to the mainstream." },
      { title: "DJ Zinc ft. Ms. Dynamite \u2013 Wile Out (2010)", note: "A veteran legend reinventing himself; connects the jungle\u2019s DNA to UK Funky\u2019s tribal rhythms seamlessly." },
      { title: "Sneakbo \u2013 Touch Ah Button (2011)", note: "A transitional landmark; UK Funky\u2019s tribal bass begins dissolving into the afro-influenced sound of Afroswing." },
      { title: "D\u2019banj \u2013 Oliver Twist (2012)", note: "Global Afrobeats crossover complete; Nigerian pop fully colonises the UK charts and signals the genre\u2019s endpoint." }
    ]
  },
  {
    freq: 105.0,
    epNum: "08",
    genre: "ROAD RAP",
    title: "EP 08 \u2013 UK ROAD RAP: TALKIN\u2019 THE HARDEST",
    subtitle: "SOUTH LONDON STREET STORIES",
    desc: "Step into 2007 as a new wave of street storytellers slows the tempo and speaks with brutal clarity. DVD culture, mixtapes, and heavy 808s shape a raw new voice from the estates. Dial in and stay locked to the underground pulse.",
    duration1: "48:12",
    duration2: "33:20",
    bitrate: "320 KBPS",
    location: "PECKHAM RADIO ARCHIVE",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    colors: {
      neonPink: "#ff3333",
      neonGreen: "#ff3333",
      surfaceLowest: "#0d0a0a",
      surfaceLow: "#1a1515"
    },
    vinylImg: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "02.02.26",
    cardEp: "EP 08 / ROAD",
    tracks1: [
      { title: "Giggs \u2013 Talkin the Hardest (2007)", note: "The founding document; Giggs\u2019s deep, unhurried delivery and vivid street storytelling launch a whole new genre." },
      { title: "PDC \u2013 Villain (2008)", note: "Raw collective power from Peckham\u2019s finest; uncompromising street narratives over heavyweight 808 production." },
      { title: "K Koke \u2013 Are You Listening (2010)", note: "Lyrical precision over dark, cinematic beats; K Koke establishes himself as road rap\u2019s most gifted wordsmith." },
      { title: "Blade Brown \u2013 Bags and Boxes (2010)", note: "Effortlessly cool delivery over a hazy, atmospheric beat; Blade Brown\u2019s most iconic and influential record." },
      { title: "Youngs Teflon \u2013 Nandos (2010)", note: "Vivid, hyperlocal London street detail and sharp wit; a future road rap classic that defined an era." },
      { title: "Sneakbo \u2013 The Wave (2011)", note: "The South London sound fully formed; Sneakbo\u2019s melodic flow bridges road rap to the incoming Afroswing movement." },
      { title: "Nines \u2013 From Church Road to Hollywood (2011)", note: "Biographical mastery; Nines translates complex personal hardship into compelling, cinematic street narrative." }
    ],
    tracks2: [
      { title: "Potter Payper \u2013 Training Day (2013)", note: "A bruising, unfiltered masterclass; lyrical density and personal authenticity at the absolute peak of road rap." },
      { title: "Casisdead \u2013 Drugs Don\u2019t Work (2013)", note: "Deadpan darkness elevated to art; an anonymous, masked figure reframes the entire genre with black humour." },
      { title: "Krept & Konan \u2013 Don\u2019t Waste My Time (2013)", note: "Duo chemistry perfectly showcased; two very different flows create an irresistible and deeply personal narrative." },
      { title: "Skrapz \u2013 Los Pollos Hermanos (2014)", note: "Pop culture lyricism meets raw street reality; Skrapz\u2019s clever cultural references elevate road rap\u2019s artistic range." },
      { title: "Section Boyz \u2013 Lock Arff (2015)", note: "A wave-defining collective anthem; Section Boyz fuse road rap\u2019s weight with a melodic, drillish energy that previews the future." },
      { title: "67 \u2013 Let\u2019s Lurk (2016)", note: "Ruthless, energetic menace over sinister production; a transitional record bridging road rap and the incoming UK drill sound." }
    ]
  },
  {
    freq: 107.3,
    epNum: "09",
    genre: "UK DRILL",
    title: "EP 09 \u2013 UK DRILL: BRIXTON BLUEPRINT",
    subtitle: "SLIDING BASS & BRUTALIST NARRATIVES",
    desc: "Witness the rise of Britain\u2019s most controversial and globally influential street sound. Chicago drill is rebuilt in South London with sliding basslines, sharp snares, and rapid-fire hats. Tune the system and hold the frequency of the streets.",
    duration1: "44:50",
    duration2: "30:40",
    bitrate: "320 KBPS",
    location: "BRIXTON ESTATE TRANSMITTER",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    colors: {
      neonPink: "#B3001B",
      neonGreen: "#00ffcc",
      surfaceLowest: "#0a070e",
      surfaceLow: "#15101c"
    },
    vinylImg: "https://images.unsplash.com/photo-1571330735066-03add572b786?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "16.02.26",
    cardEp: "EP 09 / BRIXTON",
    tracks1: [
      { title: "150 \u2013 Look How I\u2019m Smiling (2014)", note: "The zero-hour record; raw, unyielding violence as testimony, establishing the UK\u2019s own drill grammar." },
      { title: "67 \u2013 Let\u2019s Lurk (2016)", note: "Cold-blooded energy over sinister sliding basslines; the record that fully defines the South London drill aesthetic." },
      { title: "Harlem Spartans \u2013 Kennington Where It Started (2017)", note: "Hyperlocal pride anthem; the Spartans\u2019 vivid, visceral geography puts Kennington on the global map." },
      { title: "Zone 2 \u2013 Zone 2 Step (2017)", note: "Collective aggression weaponized; Tottenham\u2019s Zone 2 bring North London energy to a genre previously dominated by the South." },
      { title: "Loski \u2013 Hazards (2017)", note: "Effortless flow over atmospheric production; Loski\u2019s technical mastery and streetwise intelligence set him apart immediately." },
      { title: "Headie One x RV \u2013 Know Better (2018)", note: "Two contrasting voices in perfect dialogue; the record that signalled Headie One\u2019s evolution into a genuine superstar." },
      { title: "Unknown T \u2013 Homerton B (2018)", note: "East London\u2019s definitive declaration; raw, hyperlocal pride and unrelenting energy from Hackney\u2019s finest." }
    ],
    tracks2: [
      { title: "Russ Millions x Tion Wayne \u2013 Keisha & Becky (2019)", note: "Playful, commercial drill perfected; flips the genre\u2019s aggression into irresistible pop-culture hooks." },
      { title: "Headie One \u2013 18HUNNA (2019)", note: "Drill goes luxury; Headie bridges gritty street reality with high-end aesthetics, cementing his crossover status." },
      { title: "Central Cee \u2013 Day in the Life (2020)", note: "The independent takeover; Central Cee strips away block affiliations for sleek, universal street observations." },
      { title: "Central Cee \u2013 Loading (2020)", note: "Commercial drill masterclass; nostalgic jazz horns meet rolling 808s, expanding the genre\u2019s global demographic." },
      { title: "Tion Wayne x Russ Millions \u2013 Body (2021)", note: "The historic apex; the first pure UK drill record to capture the Official Singles Number 1 spot." },
      { title: "SR \u2013 Welcome To Brixton (2020)", note: "A menacing warning siren and dark underground textures hijack the international digital algorithm." },
      { title: "Dave & Central Cee \u2013 Sprinter (2023)", note: "Elite UK star power combines a lightweight drill bounce with luxury acoustic guitar loops for a 10-week Number 1 run." }
    ]
  },
  {
    freq: 109.8,
    epNum: "10",
    genre: "AFROSWING",
    title: "EP 10 \u2013 AFROSWING: TRANSATLANTIC ROYALTY",
    subtitle: "MELODIC DANCEHALL & AFROBEATS FUSION",
    desc: "Step out of the darkness as Afroswing brings melody, rhythm, and celebration to the forefront. British bass culture merges with West African highlife and Jamaican dancehall into something vibrant and global. Lock in the dial and stay tuned to the sound system.",
    duration1: "53:40",
    duration2: "36:15",
    bitrate: "320 KBPS",
    location: "EAST LONDON TRANSIT DOCK",
    trackUrl1: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    trackUrl2: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    colors: {
      neonPink: "#ff0099",
      neonGreen: "#ccff00",
      surfaceLowest: "#0e090b",
      surfaceLow: "#1c1216"
    },
    vinylImg: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    cardImg: null,
    cardDate: "02.03.26",
    cardEp: "EP 10 / ROYAL",
    tracks1: [
      { title: "J Hus \u2013 Did You See (2017)", note: "The undisputed blueprint. J Hus and Jae5 balance London rap cadences with undeniable African melodies, shifting British pop history." },
      { title: "Kojo Funds x J Hus \u2013 Warning (2016)", note: "Underground clash of titans; crystallizes the genre\u2019s title with a rugged, dancehall-infused vocal style carrying immense street weight." },
      { title: "Not3s \u2013 Addison Lee (2017)", note: "Digital virality unlocked; trades complex lyricism for an inescapable, lighthearted hook that defined London\u2019s youth culture." },
      { title: "Dave ft. J Hus \u2013 Samantha (2017)", note: "Elite lyricism meets melodic diaspora waves. Dave\u2019s introspective piano storytelling provides a stark contrast to Hus\u2019s infectious chorus." },
      { title: "IAMDDB \u2013 Shade (2017)", note: "Manchester\u2019s female vanguard injects hazy trap and neo-soul into the rhythmic bounce, creating a smoked-out club staple." },
      { title: "Ramz \u2013 Barking (2017)", note: "Total chart saturation; an upbeat, universally relatable anthem peaks at Number 2, establishing Afroswing as the national soundtrack." }
    ],
    tracks2: [
      { title: "Krept & Konan \u2013 Freak of the Week (2015)", note: "Early foundational crossover template; high-end R&B trends collide with a massive, platinum-selling club bounce." },
      { title: "MoStack \u2013 Shine Girl (2019)", note: "The superstar link-up; MoStack utilizes his signature cheeky, melodic flow alongside Stormzy to craft an empowering summer staple." },
      { title: "D-Block Europe \u2013 Kitchen Kings (2019)", note: "The evolution into the \u2018Wave\u2019; Young Adz and Dirtbike LB fuse Atlanta\u2019s autotuned trap aesthetics with raw UK slang." },
      { title: "Aitch \u2013 Taste (Make It Shake) (2019)", note: "The melodic swing travels North; Manchester\u2019s Aitch delivers a highly charismatic, bouncy flow over a stripped-back bass-heavy riddim." },
      { title: "Dave ft. Burna Boy \u2013 Location (2019)", note: "Cross-continental bridge; a flawless, multi-platinum anthem linking elite UK rap directly with the global Afrobeats explosion." },
      { title: "Stormzy ft. Ed Sheeran & Burna Boy \u2013 Own It (2019)", note: "A historic Number 1 hit uniting UK rap weight, global pop royalty, and African giants on one dancefloor." },
      { title: "J Hus ft. Drake \u2013 Who Told You (2023)", note: "Reclaiming the Afroswing crown; an effortlessly smooth summer hit backed by a massive transatlantic co-sign from Toronto." },
      { title: "NSG \u2013 Grandad (2020)", note: "The East London collective perfects the communal, laid-back afro-fusion vibe for the 2020s scene." }
    ]
  }
];

if (typeof module !== 'undefined') { module.exports = STATIONS; }
