// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
  tag?: string;
};

// Base path for documentation pages
const DOCS_BASE_PATH = "/docs";

export const ROUTES: EachRoute[] = [
  {
    title: "Getting Started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Introduction", href: "/introduction" },
      { title: "Installation", href: "/installation" },
    ],
  },
  {
    title: "Fundamentals",
    href: "/fundamentals",
    noLink: true,
    items: [
      {
        title: "Introduction to Go-style Errors",
        href: "/introduction-to-go-style-errors",
      },
      { title: "The Result Type", href: "/the-result-type" },
      { title: "Core Functions Overview", href: "/core-functions-overview" },
      { title: "Error Handling in go-errors", href: "/error-handling-in-go-errors" },
      {
        title: "Working with Custom Error Types",
        href: "/working-with-custom-error-types",
      },
    ],
  },
  {
    title: "API Reference",
    href: "/api-reference",
    noLink: true,
    items: [
      { title: "goSync Function", href: "/go-sync-function" },
      { title: "go Function", href: "/go-function" },
      { title: "goFetch Function", href: "/go-fetch-function" },
      { title: "unifiedGo Function", href: "/unified-go-function" },
      { title: "Type Definitions", href: "/type-definitions" }
    ],
  },
  {
    title: "Usage Guides",
    href: "/usage-guides",
    noLink: true,
    items: [
      { title: "Basic Usage Patterns", href: "/basic-usage-patterns" },
      {
        title: "Making HTTP Requests with goFetch",
        href: "/making-http-requests-with-go-fetch",
      },
      {
        title: "Advanced Usage and Patterns",
        href: "/advanced-usage-and-patterns",
        noLink: true,
        items: [
          {
            title: "Advanced Features",
            href: "/advanced-features",
          },
          {
            title: "Advanced Patterns",
            href: "/advanced-patterns",
          }
        ]
      },
      {
        title: "Asynchronous Programming with go-errors",
        href: "/asynchronous-programming-with-go-errors",
      },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute, parentPath: string = ""): Page[] {
  const ans: Page[] = [];
  // Build the current path correctly
  const currentPath = parentPath + node.href;
  
  if (!node.noLink) {
    ans.push({ title: node.title, href: currentPath });
  }
  
  node.items?.forEach((subNode) => {
    // Pass the current path as the parent path for child nodes
    ans.push(...getRecurrsiveAllLinks(subNode, currentPath));
  });
  
  return ans;
}

export const page_routes = ROUTES.map((route) => 
  getRecurrsiveAllLinks(route, DOCS_BASE_PATH)
).flat();
