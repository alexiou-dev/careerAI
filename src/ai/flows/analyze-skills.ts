// lib/google-search.ts
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!; // Custom Search Engine ID

export async function googleSearch(query: string) {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", GOOGLE_API_KEY);
  url.searchParams.set("cx", GOOGLE_CX);
  url.searchParams.set("q", query);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Google Search API request failed");

  const data = await res.json();
  return data.items?.map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  })) ?? [];
}
