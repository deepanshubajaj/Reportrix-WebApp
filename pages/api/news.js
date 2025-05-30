export default async function handler(req, res) {
  const { category, country = 'us' } = req.query;
  const apiKey = process.env.REACT_APP_NEWS_API_KEY;

  try {
    let url;
    if (category) {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?sources=cnn&apiKey=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 