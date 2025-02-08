const backendUrl = "http://localhost:3000"; // Replace with your backend URL

document.addEventListener("DOMContentLoaded", () => {
  fetchArticles();
});

async function fetchArticles() {
  try {
    const response = await fetch(`${backendUrl}/articles`);
    const articles = await response.json();
    displayArticles(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
}

function displayArticles(articles) {
  const articlesDiv = document.getElementById("articles");
  articles.forEach((article) => {
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("article");

    const title = document.createElement("h2");
    title.textContent = article.title;

    const content = document.createElement("div");
    content.innerHTML = article.content;

    articleDiv.appendChild(title);
    articleDiv.appendChild(content);

    articlesDiv.appendChild(articleDiv);
  });
}