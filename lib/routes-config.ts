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
      { title: "Core Concepts", href: "/core-concepts" },
      {
        title: "Components",
        href: "/components",
        noLink: true,
        items: [
          { title: "Code Block", href: "/code-block" },
          { title: "Custom", href: "/custom" },
          { title: "File System", href: "/file-system" },
          { title: "Image Link", href: "/image-link" },
          { title: "Note", href: "/note" },
          { title: "Stepper", href: "/stepper" },
          { title: "Tabs", href: "/tabs" },
        ],
      },
    ],
  },
  {
    title: "API Reference",
    href: "/api-reference",
    noLink: true,
    items: [
      { title: "Core Functions", href: "/core-functions" },
      { title: "Error Handling", href: "/error-handling" },
      { title: "Go", href: "/go" },
      { title: "Go Fetch", href: "/go-fetch" },
      { title: "Go Fetch Options", href: "/go-fetch-options" },
      {
        title: "HTTP",
        href: "/http",
        noLink: true,
        items: [
          { title: "Go Fetch", href: "/go-fetch" },
          { title: "Go Fetch Options", href: "/go-fetch-options" },
        ],
      },
      { title: "Types", href: "/types" },
      { title: "Unified Go", href: "/unified-go" },
    ],
  },
  {
    title: "Examples",
    href: "/examples",
    noLink: true,
    items: [
      { title: "Basic Usage", href: "/basic-usage" },
      { title: "Error Propagation", href: "/error-propagation" },
      { title: "Custom Error Types", href: "/custom-error-types" },
    ],
  },
  {
    title: "Guides",
    href: "/guides",
    noLink: true,
    items: [
      { title: "Advanced Features", href: "/advanced-features" },
      { title: "Advanced Patterns", href: "/advanced-patterns" },
      { title: "Async Patterns", href: "/async-patterns" },
      { title: "Basic Usage", href: "/basic-usage" },
      { title: "Best Practices", href: "/best-practices" },
      { title: "Edge Cases", href: "/edge-cases" },
      { title: "Error Handling", href: "/error-handling" },
      { title: "Error Normalization", href: "/error-normalization" },
      { title: "Function Differences", href: "/function-differences" },
      { title: "HTTP Requests", href: "/http-requests" },
      { title: "Type Safety", href: "/type-safety" },
      { title: "Type System", href: "/type-system" },
    ],
  },
  {
    title: "Blog",
    href: "/blog",
    items: [
      {
        title: "Why Go-Style Error Handling",
        href: "/why-go-style-error-handling",
      },
      {
        title: "Cleaner Code with Early Returns",
        href: "/cleaner-code-with-early-returns",
      },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(
  node: EachRoute,
  parentPath: string = "",
): Page[] {
  const ans: Page[] = [];
  const currentPath = parentPath + node.href;

  if (!node.noLink) {
    ans.push({ title: node.title, href: `/docs${currentPath}` });
  }

  node.items?.forEach((subNode) => {
    if (!subNode.noLink) {
      ans.push({
        title: subNode.title,
        href: `/docs${currentPath}${subNode.href}`,
      });
    }

    if (subNode.items) {
      ans.push(...getRecurrsiveAllLinks(subNode, currentPath));
    }
  });

  return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
