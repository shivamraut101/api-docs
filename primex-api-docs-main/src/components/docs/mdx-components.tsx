import {
  ApiRequest,
  ApiResponse,
  Callout,
  CodeBlock,
  EnvironmentBadge,
  Pre,
  Properties,
  Property,
  RateLimitHeaders,
  RateLimitInfo,
  StatusBadge,
  Step,
  Steps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/mdx";
import { APIEndpoint } from "@/components/mdx/APIEndpoint";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React from "react";

// MDX components mapping
export const mdxComponents = {
  APIEndpoint,
  Callout,
  Steps,
  Step,
  CodeBlock,
  RateLimitInfo,
  RateLimitHeaders,
  ApiRequest,
  ApiResponse,
  EnvironmentBadge,
  StatusBadge,

  Properties,
  Property,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  pre: Pre,
  // Basic HTML element styling
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-10 mb-3 scroll-m-20 border-b pb-2 text-2xl font-bold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 mb-2 scroll-m-20 text-xl font-medium tracking-tight" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="mt-6 mb-2 scroll-m-20 text-lg font-medium tracking-tight" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-7 not-first:mt-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const sanitizedHref =
      href
        ?.replace(/^https?:\/\/localhost:3000/, "")
        ?.replace(/^https?:\/\/api\.docs\.primexmeta\.com/, "") || "";
    const isActuallyInternal = sanitizedHref.startsWith("/") || sanitizedHref.startsWith("#");

    if (isActuallyInternal) {
      return (
        <Link
          href={sanitizedHref}
          className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-primary/50 text-muted-foreground mt-6 border-l-4 pl-6 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="bg-muted/50 border-b px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b px-4 py-2" {...props}>
      {children}
    </td>
  ),
  hr: () => <Separator className="my-8" />,
};
