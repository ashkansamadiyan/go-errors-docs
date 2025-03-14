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
    href: "/docs/getting-started",
    noLink: true,
    items: [
      { title: "Introduction", href: "/docs/getting-started/introduction" },
      { title: "Installation", href: "/docs/getting-started/installation" },
      { title: "Quick Start Guide", href: "/docs/getting-started/quick-start-guide" }
    ],
  },
  {
    title: "Fundamentals",
    href: "/docs/fundamentals",
    noLink: true,
    items: [
      {
        title: "Introduction to Go-style Errors",
        href: "/docs/fundamentals/introduction-to-go-style-errors",
      },
      { title: "The Result Type", href: "/docs/fundamentals/the-result-type" },
      { title: "Core Functions Overview", href: "/docs/fundamentals/core-functions-overview" },
      { title: "Error Handling in go-errors", href: "/docs/fundamentals/error-handling-in-go-errors" },
      {
        title: "Working with Custom Error Types",
        href: "/docs/fundamentals/working-with-custom-error-types",
      },
    ],
  },
  {
    title: "API Reference",
    href: "/docs/api-reference",
    noLink: true,
    items: [
      { title: "goSync Function", href: "/docs/api-reference/go-sync-function" },
      { title: "go Function", href: "/docs/api-reference/go-function" },
      { title: "goFetch Function", href: "/docs/api-reference/go-fetch-function" },
      { title: "unifiedGo Function", href: "/docs/api-reference/unified-go-function" },
      { title: "Type Definitions", href: "/docs/api-reference/type-definitions" }
    ],
  },
  {
    title: "Usage Guides",
    href: "/docs/usage-guides",
    noLink: true,
    items: [
      { title: "Basic Usage Patterns", href: "/docs/usage-guides/basic-usage-patterns" },
      {
        title: "Making HTTP Requests with goFetch",
        href: "/docs/usage-guides/making-http-requests-with-go-fetch",
      },
      {
        title: "Advanced Usage and Patterns",
        href: "/docs/usage-guides/advanced-usage-and-patterns",
        noLink: true,
        items: [
          {
            title: "Advanced Features",
            href: "/docs/usage-guides/advanced-usage-and-patterns/advanced-features",
          },
          {
            title: "Advanced Patterns",
            href: "/usage-guides/advanced-usage-and-patterns/advanced-patterns",
          }
        ]
      },
      {
        title: "Asynchronous Programming with go-errors",
        href: "/docs/usage-guides/asynchronous-programming-with-go-errors",
      },
    ],
  },
];

type Page = { title: string; href: string; };

function getRecurrsiveAllLinks(node: EachRoute){
    const ans: Page[] = []
    if(!node.noLink){
        ans.push({title: node.title, href: node.href})
    }
    node.items?.forEach(subNode => {
        const temp = {...subNode, href: `${node.href}${subNode.href}`}
        ans.push(...getRecurrsiveAllLinks(temp))
    })
    return ans
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat()
