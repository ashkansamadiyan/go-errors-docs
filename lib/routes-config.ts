// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
  tag?: string;
};

export const ROUTES: EachRoute[] = [
  {
    title: "Getting Started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Introduction", href: "/introduction" },
      { title: "Installation", href: "/installation" },
      { title: "Quick Start Guide", href: "/quick-start-guide" },
      { title: "Core Concepts", href: "/core-concepts" }
    ],
  },
  {
    title: "API Reference",
    href: "/api-reference",
    noLink: true,
    items: [
      { title: "Core Functions", href: "/core-functions" },
      { title: "Types", href: "/types" },
      { title: "Error Handling", href: "/error-handling" },
      { title: "Go", href: "/go" },
      { title: "goFetch", href: "/goFetch" },
      { title: "Unified Go", href: "/unified-go" }
    ],
  },
  {
    title: "Guides",
    href: "/guides",
    noLink: true,
    items: [
      // Basic Concepts
      { title: "Basic Usage", href: "/basic-usage" },
      { title: "HTTP Requests", href: "/http-requests" },
      
      // Advanced Topics
      { title: "Advanced Features", href: "/advanced-features" },
      { title: "Advanced Patterns", href: "/advanced-patterns" },
      { title: "Best Practices", href: "/best-practices" },
      
      // Error Handling
      { title: "Error Handling", href: "/error-handling" },
      { title: "Error Normalization", href: "/error-normalization" },
      { title: "Edge Cases", href: "/edge-cases" },
      { title: "Type Safety", href: "/type-safety" },
      
      // Async Programming
      { title: "Async Patterns", href: "/async-patterns" },
      { title: "Function Differences", href: "/function-differences" }
    ],
  },
  {
    title: "Examples",
    href: "/examples",
    noLink: true,
    items: [
      { title: "Basic Usage", href: "/basic-usage" },
      { title: "Error Propagation", href: "/error-propagation" },
      { title: "Custom Error Types", href: "/custom-error-types" }
    ],
  }
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
