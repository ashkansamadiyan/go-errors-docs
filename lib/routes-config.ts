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
    items: [
      { title: "API Reference", href: "/api-reference" }
    ]
  },
  {
    title: "Examples",
    href: "/examples",
    items: [
      { title: "Examples", href: "/examples" }
    ]
  },
  {
    title: "Guides",
    href: "/guides",
    noLink: true,
    items: [
      { title: "Best Practices", href: "/best-practices" },
      { title: "Advanced Patterns", href: "/advanced-patterns" }
    ]
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
