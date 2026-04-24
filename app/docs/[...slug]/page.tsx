import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "../_components/docs-shell";
import { getAllDocSlugs, getDocsPageBySlug } from "../docs-content";

type DocsEntryPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export async function generateStaticParams() {
  return getAllDocSlugs();
}

export async function generateMetadata({
  params,
}: DocsEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocsPageBySlug(slug);

  if (!page) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: page.title,
    description: page.deck,
  };
}

export default async function DocsEntryPage({ params }: DocsEntryPageProps) {
  const { slug } = await params;
  const page = getDocsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <DocsShell page={page} />;
}
