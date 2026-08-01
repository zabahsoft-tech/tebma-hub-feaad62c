/** Client-side validation for the news article admin form. */
export type NewsFormValues = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  published: boolean;
};

export type NewsFormErrors = Partial<Record<"title" | "slug" | "excerpt" | "body", string>>;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

/** Strip HTML to check the rich editor actually has content. */
function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readNewsForm(fd: FormData): NewsFormValues {
  return {
    slug: String(fd.get("slug") ?? "").trim(),
    title: String(fd.get("title") ?? "").trim(),
    excerpt: String(fd.get("excerpt") ?? "").trim() || null,
    body: String(fd.get("body") ?? ""),
    cover_url: String(fd.get("cover_url") ?? "").trim() || null,
    published: fd.get("published") === "on",
  };
}

export function validateNews(v: NewsFormValues): NewsFormErrors {
  const errors: NewsFormErrors = {};

  if (!v.title) errors.title = "Title is required.";
  else if (v.title.length < 4) errors.title = "Title must be at least 4 characters.";
  else if (v.title.length > 300) errors.title = "Title must be 300 characters or fewer.";

  if (!v.slug) errors.slug = "URL slug is required.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug))
    errors.slug = "Use lowercase letters, numbers and hyphens only (e.g. world-championship-2026).";
  else if (v.slug.length > 200) errors.slug = "Slug must be 200 characters or fewer.";

  if (v.excerpt && v.excerpt.length > 300) errors.excerpt = "Excerpt must be 300 characters or fewer.";

  const text = plainText(v.body);
  if (!text) errors.body = "Article body cannot be empty.";
  else if (text.length < 20) errors.body = "Write at least 20 characters of article body.";
  else if (v.body.length > 50000) errors.body = "Article body is too long (50,000 character limit).";

  return errors;
}
