const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CX = process.env.GOOGLE_CX!; // Custom Search Engine ID

type GoogleSearchResult = {
  title: string;
  link: string;
  snippet: string;
};

export async function googleSearch(query: string): Promise<GoogleSearchResult[]> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Google API request failed");

  const data = await res.json();
  return (
    data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    })) || []
  );
}
