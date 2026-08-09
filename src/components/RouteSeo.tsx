import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://eduverse-ai-by-yasar.lovable.app";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type RouteMeta = {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
};

const course = (name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name,
  description,
  provider: { "@type": "Organization", name: "EduVerse", url: SITE_URL },
});

const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "EduVerse — AI-Powered Learning Ecosystem",
    description:
      "Learn faster with AI tutoring, AR concept visualization, focus tracking and adaptive learning paths in one connected platform.",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: "EduVerse",
          url: SITE_URL,
          logo: OG_IMAGE,
        },
        {
          "@type": "WebSite",
          name: "EduVerse",
          url: SITE_URL,
          description:
            "AI-powered learning ecosystem with AI tutoring, AR visualization and adaptive learning paths.",
        },
      ],
    },
  },
  "/tutor": {
    title: "AI Tutor Chat — Instant Study Help | EduVerse",
    description:
      "Ask questions and get step-by-step explanations from the EduVerse AI tutor across maths, science, programming and more.",
    jsonLd: course(
      "AI Tutor Chat",
      "Conversational AI tutoring that explains any subject step by step.",
    ),
  },
  "/ar-learning": {
    title: "AR-Teach 360 — 3D Concept Visualization | EduVerse",
    description:
      "Explore interactive 3D and augmented-reality models to understand difficult concepts visually instead of memorising them.",
    jsonLd: course(
      "AR-Teach 360",
      "Augmented reality lessons that turn abstract concepts into interactive 3D models.",
    ),
  },
  "/mindpulse": {
    title: "MindPulse — Focus & Wellbeing Tracking | EduVerse",
    description:
      "Track focus, attention and study mood in real time so you can take breaks at the right moment and study healthier.",
  },
  "/talk2code": {
    title: "Talk2Code — Turn Speech Into Working Code | EduVerse",
    description:
      "Describe what you want out loud and watch Talk2Code turn your words into runnable code while explaining each step.",
    jsonLd: course(
      "Talk2Code",
      "Learn programming by speaking your ideas and reviewing the generated code.",
    ),
  },
  "/learnflow": {
    title: "LearnFlow — Guided Study Sessions | EduVerse",
    description:
      "Structure your study time with guided LearnFlow sessions that keep momentum and track what you covered.",
  },
  "/adaptive-learning": {
    title: "Adaptive Learning Paths | EduVerse",
    description:
      "Get a study path that adjusts to your mastery of each concept, revisiting weak spots and skipping what you know.",
  },
  "/progress-board": {
    title: "Progress Board — Track Your Learning | EduVerse",
    description:
      "See streaks, concept mastery and module progress on one board, with privacy controls over what you share.",
  },
  "/dashboard": {
    title: "Your Learning Dashboard | EduVerse",
    description:
      "A single place for your active modules, streaks and next recommended learning steps on EduVerse.",
  },
  "/student-dashboard": {
    title: "Student Dashboard | EduVerse",
    description:
      "Student workspace for assignments, module progress and AI study support inside EduVerse.",
  },
  "/faculty-dashboard": {
    title: "Faculty Dashboard | EduVerse",
    description:
      "Faculty view for monitoring learner progress, engagement and concept mastery across your cohort.",
  },
  "/research-dashboard": {
    title: "Research Dashboard | EduVerse",
    description:
      "Aggregate learning analytics for research on engagement, mastery and adaptive study patterns.",
  },
  "/select-role": {
    title: "Choose Your Role | EduVerse",
    description:
      "Pick whether you are joining EduVerse as a student, faculty member or research expert to tailor your workspace.",
  },
  "/auth": {
    title: "Sign In to EduVerse",
    description:
      "Sign in or create an EduVerse account to keep your learning progress, streaks and adaptive study path in sync.",
  },
};

const fallback: RouteMeta = {
  title: "EduVerse — AI-Powered Learning Ecosystem",
  description:
    "Learn faster with AI tutoring, AR concept visualization, focus tracking and adaptive learning paths.",
};

const RouteSeo = () => {
  const { pathname } = useLocation();
  const meta = routeMeta[pathname] ?? fallback;
  const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  const noindex = !routeMeta[pathname];

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {meta.jsonLd && (
        <script type="application/ld+json">{JSON.stringify(meta.jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default RouteSeo;
