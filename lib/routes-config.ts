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
      { title: "Introduction", href: "/getting-started/introduction" },
      { title: "Installation", href: "/getting-started/installation" },
      { title: "Quick Start Guide", href: "/getting-started/quick-start-guide" }
    ],
  },
  {
    title: "Fundamentals",
    href: "/fundamentals",
    noLink: true,
    items: [
      {
        title: "Introduction to Go-style Errors",
        href: "/fundamentals/introduction-to-go-style-errors",
      },
      { title: "The Result Type", href: "/fundamentals/the-result-type" },
      { title: "Core Functions Overview", href: "/fundamentals/core-functions-overview" },
      { title: "Error Handling in go-errors", href: "/fundamentals/error-handling-in-go-errors" },
      {
        title: "Working with Custom Error Types",
        href: "/fundamentals/working-with-custom-error-types",
      },
    ],
  },
  {
    title: "API Reference",
    href: "/api-reference",
    noLink: true,
    items: [
      { title: "goSync Function", href: "/api-reference/go-sync-function" },
      { title: "go Function", href: "/api-reference/go-function" },
      { title: "goFetch Function", href: "/api-reference/go-fetch-function" },
      { title: "unifiedGo Function", href: "/api-reference/unified-go-function" },
      { title: "Type Definitions", href: "/api-reference/type-definitions" }
    ],
  },
  {
    title: "Usage Guides",
    href: "/usage-guides",
    noLink: true,
    items: [
      { title: "Basic Usage Patterns", href: "/usage-guides/basic-usage-patterns" },
      {
        title: "Making HTTP Requests with goFetch",
        href: "/usage-guides/making-http-requests-with-go-fetch",
      },
      {
        title: "Advanced Usage and Patterns",
        href: "/usage-guides/advanced-usage-and-patterns",
        noLink: true,
        items: [
          {
            title: "Advanced Features",
            href: "/usage-guides/advanced-usage-and-patterns/advanced-features",
          },
          {
            title: "Advanced Patterns",
            href: "/usage-guides/advanced-usage-and-patterns/advanced-patterns",
          }
        ]
      },
      {
        title: "Asynchronous Programming with go-errors",
        href: "/usage-guides/asynchronous-programming-with-go-errors",
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
