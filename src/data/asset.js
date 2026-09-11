/**
 * Resolve a public asset path against the deployment's base URL.
 *
 * Vite rebases what it can see — imports, CSS `url()`, attributes in
 * index.html — but a path that only exists as a string in a data file is
 * invisible to it. Those are exactly the paths this site is built on, so
 * every one of them goes through here. Without it the whole site works at a
 * domain root and loses all of its media on a project page served from
 * /<repo>/.
 */
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
