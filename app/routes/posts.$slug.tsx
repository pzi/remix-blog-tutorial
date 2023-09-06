import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getPost } from "./post.server";
import { Link, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;

  invariant(slug, "slug is required");
  const post = await getPost(slug);

  invariant(post, `post not found: ${slug}`);
  const html = marked(post.markdown);

  return json({ title: post.title, html });
};

export default function PostSlug() {
  const { title, html } = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <p className="mt-8">
        <Link to="/posts" className="text-blue-600">
          👈🏼 <span className="underline">Back to all posts</span>
        </Link>
      </p>
    </main>
  );
}
