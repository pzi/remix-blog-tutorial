import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, isRouteErrorResponse, useActionData, useLoaderData, useNavigation, useParams, useRouteError } from "@remix-run/react";
import { createPost, deletePost, getPost, updatePost } from "./post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUser(request)

  invariant(params.slug, 'Missing slug.');

  if (params.slug === 'new') {
    return json({ post: null })
  }

  const post = await getPost(params.slug);

  if (!post) {
    throw json({message: 'Not found.'}, {status: 404})

    // without nice json
    throw new Response('Not found.', {
      status: 404
    })
  }

  return json({ post })
}

type ActionData = {
  title: string | null,
  slug: string | null,
  markdown: string | null
} | undefined

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUser(request)
  invariant(params.slug, "Slug is required.")

  const formData = await request.formData();
  // console.log(Object.fromEntries(formData));

  const intent = formData.get('intent');

  if (intent === 'delete') {
    await deletePost(params.slug);
    return redirect('/posts/admin');
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage
  );

  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === 'new') {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost(params.slug, { title, slug, markdown })
  }

  return redirect('/posts/admin')

  // without handy `redirect` util
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/posts/admin',
    }
  })
}

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function NewPost() {
  const errors = useActionData<ActionData>();
  const data = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  // const isSubmitting = navigation.state === 'submitting'
  const isCreating = navigation.formData?.get('intent') === 'create'
  const isUpdating = navigation.formData?.get('intent') === 'update'
  const isDeleting = navigation.formData?.get('intent') === 'delete'
  const isNewPost = !data.post

  return (
    <Form method="post" key={data?.post?.slug ?? 'new'}>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={data?.post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={data?.post?.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">
              {errors.markdown}
            </em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={data?.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value={isNewPost ? 'create' : 'update'}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : (isUpdating ? "Updating..." : "Update Post")}
          {/* {isNewPost
            ? isSubmitting
              ? "Creating..."
              : "Create Post"
            : isSubmitting
              ? "Updating..."
              : "Update Post"} */}
        </button>
      </div>
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const params = useParams()

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    console.log(error)
    return (
      <div>
        <h1>Uh oh! The post with the slug "{params.slug}" does not exist!</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}
