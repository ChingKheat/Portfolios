/**
 * Portfolio & Project Showcase Data Configuration
 * Edit this file to add, remove, or modify your showcased projects and profile details.
 */

const PROFILE_DATA = {
  name: "Alex Rivera",
  handle: "@alexrivera",
  title: "Senior Full-Stack & AI Systems Architect",
  bio: "Building robust distributed systems, high-performance web applications, and intuitive AI-powered developer tooling.",
  location: "San Francisco, CA / Remote",
  status: "Available for select opportunities & consulting",
  avatar: "assets/avatar.png", // or URL
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    email: "alex.rivera.dev@example.com"
  },
  stats: {
    yearsExperience: "6+",
    productionApps: "18+",
    githubStars: "1.4k+",
    codeCommits: "3,200+"
  }
};

const PROJECTS_DATA = [
  {
    id: "nexus-ai-orchestrator",
    title: "Nexus AI Orchestrator",
    tagline: "Autonomous multi-agent orchestration engine with real-time streaming",
    category: "AI & Machine Learning",
    status: "Live",
    featured: true,
    stars: 540,
    year: "2026",
    metrics: "10x agent speedup • 99.8% precision",
    bannerGradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
    icon: "cpu",
    summary: "High-throughput asynchronous execution environment for autonomous LLM agents with interactive DAG visualizer and real-time state synchronization.",
    fullDescription: "Nexus AI is a next-generation orchestration platform designed to coordinate complex multi-step reasoning chains between specialized AI agents. It features an interactive directed acyclic graph (DAG) execution engine, streaming token telemetry, distributed memory caching, and failover fallbacks across multiple LLM providers.",
    challenges: "Achieving sub-50ms latency while synchronizing complex multi-agent state trees across WebSockets with resilient error-recovery strategies during upstream model throttling.",
    keyFeatures: [
      "Dynamic DAG workflow builder with live visual execution tracing",
      "Streaming token telemetry and granular token cost optimizer",
      "Failover router across OpenAI, Anthropic, and Gemini models",
      "Vector embeddings memory retrieval powered by pgvector and Redis",
      "Strict schema enforcement with Zod runtime validation"
    ],
    techStack: ["TypeScript", "Next.js 15", "Python", "FastAPI", "Redis", "PostgreSQL", "Docker", "Tailwind CSS"],
    demoUrl: "https://example.com/demo/nexus-ai",
    githubUrl: "https://github.com/example/nexus-ai-orchestrator"
  },
  {
    id: "hyperpulse-analytics",
    title: "HyperPulse Analytics",
    tagline: "Ultra-low-latency real-time telemetry and API performance monitoring",
    category: "Cloud & DevOps",
    status: "Live",
    featured: true,
    stars: 385,
    year: "2025",
    metrics: "12M events/sec • <15ms query",
    bannerGradient: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)",
    icon: "activity",
    summary: "Distributed observability engine processing real-time telemetry, error tracking, and custom metric queries with instant interactive charts.",
    fullDescription: "HyperPulse is an enterprise-grade performance monitoring suite built to ingest tens of millions of serverless event logs and API traces every minute. Provides sub-second query speeds across multi-terabyte datasets using vectorized storage and WebGL-accelerated time-series rendering.",
    challenges: "Handling sporadic 100x traffic spikes while maintaining constant memory consumption and sub-second aggregations on time-series records.",
    keyFeatures: [
      "High-throughput ingest gateway with backpressure buffering",
      "Interactive time-series explorer with WebGL line chart rendering",
      "Automated anomaly detection alerts via Slack and Discord webhooks",
      "Zero-overhead eBPF agents for Linux runtime telemetry",
      "Role-based access control with audited team workspaces"
    ],
    techStack: ["Go", "ClickHouse", "Rust", "React", "TypeScript", "gRPC", "Docker", "Kubernetes"],
    demoUrl: "https://example.com/demo/hyperpulse",
    githubUrl: "https://github.com/example/hyperpulse-telemetry"
  },
  {
    id: "zenith-commerce-engine",
    title: "Zenith Commerce Engine",
    tagline: "Headless, multi-tenant e-commerce platform with sub-second checkout",
    category: "Full-Stack",
    status: "Live",
    featured: true,
    stars: 290,
    year: "2025",
    metrics: "99.99% uptime • $2.4M GMV handled",
    bannerGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
    icon: "shopping-bag",
    summary: "Blazing-fast headless commerce platform featuring edge-computed personalized storefronts, localized currency routing, and instant cart mutations.",
    fullDescription: "Zenith provides digital brands with a modular headless commerce framework. Built with micro-frontend storefronts, globally distributed edge caching, real-time inventory locking, and unified Stripe/Adyen payment intent pipelines.",
    challenges: "Eliminating cart race conditions during viral flash-sale drops with distributed atomic locks while keeping client checkout latency under 300ms.",
    keyFeatures: [
      "Edge-rendered storefronts achieving 100/100 Lighthouse performance",
      "Optimistic UI updates with instant cart mutation feedback",
      "Multi-currency conversion with automatic tax jurisdiction calculation",
      "Stripe Connect custom onboarding for multi-vendor marketplaces",
      "Automated inventory reservation system with expiring lock leases"
    ],
    techStack: ["React", "Next.js", "Node.js", "PostgreSQL", "Stripe API", "GraphQL", "Tailwind CSS"],
    demoUrl: "https://example.com/demo/zenith",
    githubUrl: "https://github.com/example/zenith-commerce"
  },
  {
    id: "synthwave-audio-workstation",
    title: "Aura DAW & Sound Studio",
    tagline: "Collaborative browser-based digital audio workstation with WebAudio",
    category: "Full-Stack",
    status: "Beta",
    featured: false,
    stars: 412,
    year: "2025",
    metrics: "60 FPS rendering • 0ms audio lag",
    bannerGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
    icon: "music",
    summary: "Professional multi-track in-browser audio workstation with real-time WebRTC collaborative editing, synthesizer presets, and parametric visual EQ.",
    fullDescription: "Aura is an innovative WebAudio and WebAssembly audio workstation that brings studio-grade multi-track recording directly to the browser. Multiple musicians can connect in the same session to arrange MIDI sequences, record vocal audio tracks, and tweak DSP audio filters simultaneously in real time.",
    challenges: "Compiling high-performance C++ DSP reverb and distortion algorithms to WebAssembly while avoiding audio glitching during browser main thread garbage collection cycles.",
    keyFeatures: [
      "Multi-track non-destructive audio and MIDI arrangement timeline",
      "WebAudio AudioWorklet architecture for glitch-free DSP sound processing",
      "Real-time multiplayer cursor and session collaboration via CRDTs",
      "Built-in polyphonic FM synthesizer and customizable drum sequencer",
      "Export directly to lossless WAV, FLAC, and high-bitrate MP3"
    ],
    techStack: ["WebAssembly", "C++", "TypeScript", "Canvas API", "WebAudio API", "WebRTC", "Tailwind CSS"],
    demoUrl: "https://example.com/demo/aura-daw",
    githubUrl: "https://github.com/example/aura-sound-studio"
  },
  {
    id: "chronos-cli",
    title: "Chronos CLI Toolchain",
    tagline: "Blazing fast developer productivity toolkit for repository automation",
    category: "Open Source & Tools",
    status: "Live",
    featured: false,
    stars: 620,
    year: "2025",
    metrics: "45k+ npm downloads • 0 dependencies",
    bannerGradient: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #0284c7 100%)",
    icon: "terminal",
    summary: "Command-line tool that automates semantic versioning, git changelogs, multi-package monorepo releases, and cloud preview environments.",
    fullDescription: "Chronos was created to solve monotonous release workflows across large monorepos. Built in Rust with zero runtime dependencies, it scans git commit graphs, detects affected workspaces, tags releases, and generates markdown release notes in under 12 milliseconds.",
    challenges: "Designing an ultra-lightweight binary that runs identically across Windows, macOS, and Linux without external system dependencies.",
    keyFeatures: [
      "Conventional commits parser with customizable team lint rules",
      "Sub-15ms execution time even on monorepos with 10,000+ commits",
      "GitHub & GitLab release notes and tag automation",
      "Automatic dependency graph resolution for pnpm, bun, and cargo",
      "Interactive terminal UI with keyboard-guided release staging"
    ],
    techStack: ["Rust", "Shell Scripting", "GitHub Actions", "CI/CD", "WebAssembly"],
    demoUrl: "https://example.com/demo/chronos-cli",
    githubUrl: "https://github.com/example/chronos-cli"
  },
  {
    id: "pulse-mobile-fintech",
    title: "VaultFlow Mobile Wealth",
    tagline: "Next-gen crypto & fiat portfolio companion with biometric security",
    category: "Mobile Apps",
    status: "Live",
    featured: true,
    stars: 215,
    year: "2024",
    metrics: "4.9/5 on App Store • 35k Active Users",
    bannerGradient: "linear-gradient(135deg, #10b981 0%, #047857 50%, #064e3b 100%)",
    icon: "smartphone",
    summary: "Cross-platform mobile investment and net-worth tracking application featuring live exchange feeds, automated DCA calculators, and offline-first encryption.",
    fullDescription: "VaultFlow bridges decentralized and traditional financial tracking in a sleek, haptic-rich mobile interface. Built with Flutter, it features end-to-end client-side AES-256 encryption, zero-knowledge account backup, and instant interactive charts rendered at a fluid 120Hz.",
    challenges: "Building an offline-first sync layer that reliably resolves conflicting transaction updates when users reconnect from unstable mobile networks.",
    keyFeatures: [
      "Hardware-level biometric authorization (FaceID & Fingerprint)",
      "Zero-knowledge encrypted local SQLite database with SQLCipher",
      "Smooth 120Hz micro-animations and gesture navigation",
      "Automated currency conversion and cost-basis tax reporting",
      "Instant push notifications for market trend triggers"
    ],
    techStack: ["Flutter", "Dart", "Firebase", "SQLite", "Bloc Pattern", "REST API", "Figma"],
    demoUrl: "https://example.com/demo/vaultflow",
    githubUrl: "https://github.com/example/vaultflow-mobile"
  },
  {
    id: "deep-vision-segmentation",
    title: "NeuroScan Medical Vision",
    tagline: "Computer vision platform for automated MRI scan lesion detection",
    category: "AI & Machine Learning",
    status: "Beta",
    featured: false,
    stars: 310,
    year: "2024",
    metrics: "97.4% DICE score • 3D volumetric slice",
    bannerGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #4c1d95 100%)",
    icon: "eye",
    summary: "Deep learning research pipeline that assists radiologists by highlighting structural anomalies in 3D CT/MRI volumetric scans with uncertainty overlays.",
    fullDescription: "NeuroScan leverages modified 3D U-Net neural architectures trained on high-resolution DICOM datasets. It presents medical professionals with interactive 3D slice segmentations, volumetric measurements, and confidence interval heatmaps to accelerate diagnostic review times.",
    challenges: "Optimizing 3D convolutional inference times to enable real-time interactive sliding through 512x512x256 voxel volumes on consumer GPU hardware.",
    keyFeatures: [
      "Native browser-based DICOM medical image viewer with windowing presets",
      "3D volumetric mesh reconstruction using Marching Cubes algorithm",
      "Confidence heatmaps indicating model uncertainty and attention focus",
      "HIPAA-compliant on-premise execution mode with anonymization filters",
      "Batch export of clinical quantitative analysis reports"
    ],
    techStack: ["Python", "PyTorch", "FastAPI", "React", "Three.js", "WebGL", "Docker"],
    demoUrl: "https://example.com/demo/neuroscan",
    githubUrl: "https://github.com/example/neuroscan-vision"
  },
  {
    id: "fleet-infra-controller",
    title: "KubeKite Edge Gateway",
    tagline: "Lightweight reverse proxy and ingress controller for Kubernetes edge clusters",
    category: "Cloud & DevOps",
    status: "In Progress",
    featured: false,
    stars: 180,
    year: "2026",
    metrics: "3.2MB binary • 800k req/sec",
    bannerGradient: "linear-gradient(135deg, #ec4899 0%, #be185d 50%, #831843 100%)",
    icon: "server",
    summary: "Ultra-compact HTTP/3 and gRPC reverse proxy built specifically for resource-constrained edge computing environments and micro-cluster topologies.",
    fullDescription: "KubeKite provides lightning-fast edge traffic routing, automatic Let's Encrypt SSL termination, and dynamic Canary routing rules without the overhead of heavy legacy ingress controllers. Memory footprint stays under 15MB even under sustained loads.",
    challenges: "Implementing zero-copy packet forwarding using Linux io_uring while managing automatic TLS certificate lifecycle rotations asynchronously.",
    keyFeatures: [
      "Full HTTP/3 and QUIC transport protocol support",
      "Dynamic canary deployments with percentage-based traffic splitting",
      "Automated ACME Let's Encrypt TLS certificate provisioning",
      "Distributed rate limiting via gossip protocol mesh",
      "Prometheus metrics endpoint and OpenTelemetry tracing"
    ],
    techStack: ["Go", "Kubernetes", "Linux", "gRPC", "Prometheus", "Envoy", "Docker"],
    demoUrl: "https://example.com/demo/kubekite",
    githubUrl: "https://github.com/example/kubekite-edge"
  }
];

const MILESTONES_DATA = [
  {
    date: "Q3 2026",
    title: "Launched Nexus AI Multi-Agent Platform v2.0",
    desc: "Shipped collaborative DAG visualizer and reduced LLM failover latency by 45%."
  },
  {
    date: "Q1 2026",
    title: "Chronos CLI crossed 45,000 package downloads",
    desc: "Recognized as top trending developer utility on GitHub for two consecutive weeks."
  },
  {
    date: "Q4 2025",
    title: "HyperPulse Telemetry processed 1 Billion events",
    desc: "Scaled ClickHouse database cluster across three multi-region availability zones."
  },
  {
    date: "Q2 2025",
    title: "VaultFlow Mobile featured in App Store Top Picks",
    desc: "Achieved 4.9/5 stars over 3,000+ verified customer reviews."
  }
];
