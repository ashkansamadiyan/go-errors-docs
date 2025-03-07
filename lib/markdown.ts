import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import { promises as fs } from "fs";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeCodeTitles from "rehype-code-titles";
import { page_routes, ROUTES } from "./routes-config";
import { visit } from "unist-util-visit";
import matter from "gray-matter";
import { getIconName, hasSupportedExtension } from "./utils";

// custom components imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pre from "@/components/markdown/pre";
import Note from "@/components/markdown/note";
import { Stepper, StepperItem } from "@/components/markdown/stepper";
import Image from "@/components/markdown/image";
import Link from "@/components/markdown/link";
import Outlet from "@/components/markdown/outlet";
import Files from "@/components/markdown/files";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// add custom components
const components = {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  Note,
  Stepper,
  StepperItem,
  img: Image,
  a: Link,
  Outlet,
  Files,
  table: Table,
  thead: TableHeader,
  th: TableHead,
  tr: TableRow,
  tbody: TableBody,
  t: TableCell,
};

// can be used for other pages like blogs, Guides etc
async function parseMdx<Frontmatter>(rawMdx: string) {
  return await compileMDX<Frontmatter>({
    source: rawMdx,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        format: 'mdx',
        development: process.env.NODE_ENV === 'development',
        rehypePlugins: [
          preProcess,
          rehypeCodeTitles,
          [rehypePrism, { showLineNumbers: true }],
          rehypeSlug,
          [rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
              className: ['anchor']
            }
          }],
          postProcess,
        ],
        remarkPlugins: [
          remarkGfm,
          // Add any other remark plugins you need
        ],
      },
    },
    components,
  });
}

// logic for docs

export type BaseMdxFrontmatter = {
  title: string;
  description: string;
};

export async function getDocsForSlug(slug: string) {
  try {
    const contentPath = await getDocsContentPath(slug);
    const rawMdx = await fs.readFile(contentPath, "utf-8");
    return await parseMdx<BaseMdxFrontmatter>(rawMdx);
  } catch (err) {
    console.log(err);
  }
}

export async function getDocsTocs(slug: string) {
  const contentPath = await getDocsContentPath(slug);
  const rawMdx = await fs.readFile(contentPath, "utf-8");
  // captures between ## - #### can modify accordingly
  const headingsRegex = /^(#{2,4})\s(.+)$/gm;
  let match;
  const extractedHeadings = [];
  while ((match = headingsRegex.exec(rawMdx)) !== null) {
    const headingLevel = match[1].length;
    const headingText = match[2].trim();
    const slug = sluggify(headingText);
    extractedHeadings.push({
      level: headingLevel,
      text: headingText,
      href: `#${slug}`,
    });
  }
  return extractedHeadings;
}

export function getPreviousNext(path: string) {
  const index = page_routes.findIndex(({ href }) => href == `/${path}`);
  return {
    prev: page_routes[index - 1],
    next: page_routes[index + 1],
  };
}

function sluggify(text: string) {
  const slug = text.toLowerCase().replace(/\s+/g, "-");
  return slug.replace(/[^a-z0-9-]/g, "");
}

async function getDocsContentPath(slug: string) {
  const basePath = path.join(process.cwd(), "/contents/docs/");
  
  // Remove any leading /docs/ from the slug
  const cleanSlug = slug.replace(/^docs\//, '');
  
  // Try the index.mdx structure first
  const indexPath = path.join(basePath, cleanSlug, "index.mdx");
  const directPath = path.join(basePath, `${cleanSlug}.mdx`);
  
  try {
    await fs.access(indexPath);
    return indexPath;
  } catch {
    try {
      await fs.access(directPath);
      return directPath;
    } catch {
      // If neither exists, return the original path to maintain existing error handling
      return indexPath;
    }
  }
}

function justGetFrontmatterFromMD<Frontmatter>(rawMd: string): Frontmatter {
  return matter(rawMd).data as Frontmatter;
}

export async function getAllChilds(pathString: string) {
  const items = pathString.split("/").filter((it) => it != "");
  let page_routes_copy = ROUTES;

  // Find the current route section
  let currentRoute = null;
  for (const it of items) {
    currentRoute = page_routes_copy.find((innerIt) => {
      const routePath = innerIt.href.replace(/^\/docs\//, '');
      return routePath === it || routePath.split('/')[0] === it;
    });
    if (!currentRoute) break;
    page_routes_copy = currentRoute.items ?? [];
  }
  
  if (!currentRoute) return [];

  return await Promise.all(
    (currentRoute.items ?? []).map(async (it) => {
      // Build the correct path relative to the current section
      const sectionPath = currentRoute.href.replace(/^\/docs\//, '');
      const itemPath = it.href.replace(/^\//, '');
      const fullPath = path.join(sectionPath, itemPath);

      // Try both index.mdx and direct .mdx paths
      const basePath = path.join(process.cwd(), "/contents/docs/");
      const indexPath = path.join(basePath, fullPath, "index.mdx");
      const directPath = path.join(basePath, `${fullPath}.mdx`);
      
      let raw;
      try {
        await fs.access(indexPath);
        raw = await fs.readFile(indexPath, "utf-8");
      } catch {
        try {
          await fs.access(directPath);
          raw = await fs.readFile(directPath, "utf-8");
        } catch {
          console.warn(`Neither ${indexPath} nor ${directPath} exists`);
          return null;
        }
      }

      if (!raw) return null;

      return {
        ...justGetFrontmatterFromMD<BaseMdxFrontmatter>(raw),
        href: `/docs/${fullPath}`,
      };
    }),
  ).then(results => results.filter(Boolean));
}

// for copying the code in pre
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const preProcess = () => (tree: any) => {
  visit(tree, (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      const [codeEl] = node.children;
      if (codeEl.tagName !== "code") return;
      node.raw = codeEl.children?.[0].value;
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const postProcess = () => (tree: any) => {
  visit(tree, "element", (node) => {
    if (node?.type === "element" && node?.tagName === "pre") {
      node.properties["raw"] = node.raw;
    }
  });
};

export type Author = {
  avatar?: string;
  handle: string;
  username: string;
  handleUrl: string;
};

export type BlogMdxFrontmatter = BaseMdxFrontmatter & {
  date: string;
  authors: Author[];
  cover: string;
};

export async function getAllBlogStaticPaths() {
  try {
    const blogFolder = path.join(process.cwd(), "/contents/blogs/");
    const res = await fs.readdir(blogFolder);
    return res.map((file) => file.split(".")[0]);
  } catch (err) {
    console.log(err);
  }
}
export async function getAllBlogs() {
  const blogFolder = path.join(process.cwd(), "/contents/blogs/");
  const files = await fs.readdir(blogFolder);
  const uncheckedRes = await Promise.all(
    files.map(async (file) => {
      if (!file.endsWith(".mdx")) return undefined;
      const filepath = path.join(process.cwd(), `/contents/blogs/${file}`);
      const rawMdx = await fs.readFile(filepath, "utf-8");
      return {
        ...justGetFrontmatterFromMD<BlogMdxFrontmatter>(rawMdx),
        slug: file.split(".")[0],
      };
    }),
  );
  return uncheckedRes.filter((it) => !!it) as (BlogMdxFrontmatter & {
    slug: string;
  })[];
}

export async function getBlogForSlug(slug: string) {
  const blogFile = path.join(process.cwd(), "/contents/blogs/", `${slug}.mdx`);
  try {
    const rawMdx = await fs.readFile(blogFile, "utf-8");
    return await parseMdx<BlogMdxFrontmatter>(rawMdx);
  } catch {
    return undefined;
  }
}

function rehypeCodeTitlesWithLogo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (
        node?.tagName === "div" &&
        node?.properties?.className?.includes("rehype-code-title")
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const titleTextNode = node.children.find((child: any) =>
          child.type === "text"
        );
        if (!titleTextNode) return;

        // Extract filename and language
        const titleText = titleTextNode.value;
        const match = hasSupportedExtension(titleText);
        if (!match) return;

        const splittedNames = titleText.split(".");
        const ext = splittedNames[splittedNames.length - 1];
        const iconClass = `devicon-${
          getIconName(
            ext,
          )
        }-plain text-[17px]`;

        // Insert icon before title text
        if (iconClass) {
          node.children.unshift({
            type: "element",
            tagName: "i",
            properties: { className: [iconClass, "code-icon"] },
            children: [],
          });
        }
      }
    });
  };
}
