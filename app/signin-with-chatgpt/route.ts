// Compatibility for links in the existing chat shell. Sites-specific identity
// headers are never trusted on the public Vercel deployment.
export function GET(request: Request) {
  return Response.redirect(new URL('/signin', request.url));
}
