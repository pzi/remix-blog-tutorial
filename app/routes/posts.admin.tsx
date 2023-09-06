import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { getPostListings } from "./post.server";
import { requireAdminUser } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUser(request)
  return json({ posts: await getPostListings() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        Blog Admin
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={post.slug}
                  prefetch="intent"
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className='mt-8'>
            <Link to="/posts" className="text-blue-600">
              👈🏼 <span className="underline">Back to all posts</span>
            </Link>
          </p>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
