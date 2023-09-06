import { Outlet, isRouteErrorResponse, useParams, useRouteError } from "@remix-run/react";

export default function PostsRoute() {
  return <Outlet />
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
