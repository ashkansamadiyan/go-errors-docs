import { buttonVariants } from "@/components/ui/button";
import { page_routes } from "@/lib/routes-config";
import { MoveUpRightIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex sm:min-h-[85.5vh] min-h-[82vh] flex-col sm:items-center justify-center text-center px-2 sm:py-8 py-12">
      <Link
        href="https://github.com/ashkansamadiyan/go-style-errors"
        target="_blank"
        className="mb-5 sm:text-lg flex items-center gap-2 underline underline-offset-4 sm:-mt-12"
      >
        View on GitHub{" "}
        <MoveUpRightIcon className="w-4 h-4 font-extrabold" />
      </Link>
      <h1 className="text-[2.4rem] leading-10 sm:leading-[4.5rem] font-bold mb-4 sm:text-6xl text-left sm:text-center">
        Go-style error handling for TypeScript
      </h1>
      <p className="mb-8 sm:text-lg max-w-[800px] text-muted-foreground text-left sm:text-center">
        Handle errors elegantly without try-catch blocks, using a functional approach that&apos;s both type-safe and intuitive.
        Zero dependencies, tree-shakeable, and optimized for production.
      </p>
      <div className="sm:flex sm:flex-row grid grid-cols-2 items-center sm:gap-5 gap-3 mb-8">
        <Link
          href={`/docs${page_routes[0].href}`}
          className={buttonVariants({ className: "px-6", size: "lg" })}
        >
          Get Started
        </Link>
        <Link
          href="/docs/examples"
          className={buttonVariants({
            variant: "secondary",
            className: "px-6",
            size: "lg",
          })}
        >
          View Examples
        </Link>
      </div>
      
      <div className="mt-8 grid sm:grid-cols-3 grid-cols-1 gap-6 max-w-[800px]">
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Type-Safe</h3>
          <p className="text-muted-foreground">Full TypeScript support with proper type inference and error handling</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Zero Dependencies</h3>
          <p className="text-muted-foreground">Lightweight and tree-shakeable with no external dependencies</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Unified API</h3>
          <p className="text-muted-foreground">Consistent error handling for both sync and async operations</p>
        </div>
      </div>
    </div>
  );
}
