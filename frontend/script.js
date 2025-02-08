const backendUrl = "http://localhost:3000"; // Replace with your backend URL

let isLoggedIn = false;
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  // Check if already logged in (e.g., using localStorage)
  const storedLoginStatus = localStorage.getItem('isLoggedIn');
  const storedUser = localStorage.getItem('currentUser');
  if (storedLoginStatus === 'true' && storedUser) {
    isLoggedIn = true;
    currentUser = JSON.parse(storedUser);
    showAdminDashboard();
  } else {
    showLoginForm();
  }
});

function showLoginForm() {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("registration-form").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "none";
  document.getElementById("articles").style.display = "none";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("create-user").style.display = "none";
}

function showRegistrationForm() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("registration-form").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
  document.getElementById("articles").style.display = "none";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("create-user").style.display = "none";
}

function showAdminDashboard() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("registration-form").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "block";
  document.getElementById("articles").style.display = "block";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("create-user").style.display = "none";
  document.getElementById("user-greeting").textContent = `Welcome, ${currentUser.username}! `;
  fetchArticles();
}

async function register() {
  const email = document.getElementById("register-email").value;
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch(`${backendUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, username, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration successful. Please log in.");
      showLoginForm();
    } else {
      document.getElementById("registration-error").textContent = data.message || "Registration failed.";
    }
  } catch (error) {
    console.error("Error registering user:", error);
    document.getElementById("registration-error").textContent = "Registration failed.";
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${backendUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      isLoggedIn = true;
      currentUser = data.user;
      localStorage.setItem('isLoggedIn', 'true'); // Store login status
      localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Store user data
      showAdminDashboard();
    } else {
      document.getElementById("login-error").textContent = data.message || "Invalid credentials";
    }
  } catch (error) {
    console.error("Error logging in:", error);
    document.getElementById("login-error").textContent = "Invalid credentials";
  }
}

function logout() {
  isLoggedIn = false;
  currentUser = null;
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  showLoginForm();
}

function showArticleList() {
  document.getElementById("article-list").style.display = "block";
  document.getElementById("articles").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("create-user").style.display = "none";
  populateArticleList();
}

function showCreateArticleForm() {
  document.getElementById("edit-article").style.display = "block";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("articles").style.display = "none";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("create-user").style.display = "none";
  clearArticleForm();
}

function showUserManagement() {
  document.getElementById("user-management").style.display = "block";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("articles").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
  document.getElementById("create-user").style.display = "none";
  populateUserList();
}

function showCreateUserForm() {
  document.getElementById("create-user").style.display = "block";
  document.getElementById("user-management").style.display = "none";
  document.getElementById("article-list").style.display = "none";
  document.getElementById("articles").style.display = "none";
  document.getElementById("edit-article").style.display = "none";
}

async function fetchArticles() {
  try {
    const response = await fetch(`${backendUrl}/articles`);
    const articles = await response.json();
    displayArticles(articles);
    return articles; // Return articles for use in populateArticleList
  } catch (error) {
    console.error("Error fetching articles:", error);
    return []; // Return an empty array in case of error
  }
}

function displayArticles(articles) {
  const articlesDiv = document.getElementById("articles");
  articlesDiv.innerHTML = '<h2>Articles <i class="fa fa-newspaper"></i></h2>'; // Clear existing articles

  articles.forEach((article) => {
    const articleDiv = document.createElement("div");
    articleDiv.classList.add("article");

    const title = document.createElement("h2");
    title.textContent = article.title;

    const content = document.createElement("div");
    content.innerHTML = sanitizeInput(article.content); // Sanitize content

    articleDiv.appendChild(title);
    articleDiv.appendChild(content);

    articlesDiv.appendChild(articleDiv);
  });
}

async function populateArticleList() {
  const articles = await fetchArticles(); // Fetch articles
  const articleTableBody = document.getElementById("article-table").getElementsByTagName("tbody")[0];
  articleTableBody.innerHTML = ""; // Clear existing rows

  articles.forEach((article) => {
    let row = articleTableBody.insertRow();

    let selectCell = row.insertCell(0);
    let titleCell = row.insertCell(1);
    let actionCell = row.insertCell(2);

    selectCell.innerHTML = `<input type="checkbox" value="${article.id}">`;
    titleCell.textContent = article.title;
    actionCell.innerHTML = `<button onclick="editArticle(${article.id})"><i class="fa fa-edit"></i> Edit</button>`;
  });
}

async function populateUserList() {
  try {
    const response = await fetch(`${backendUrl}/users`);
    const users = await response.json();
    const userTableBody = document.getElementById("user-table").getElementsByTagName("tbody")[0];
    userTableBody.innerHTML = "";

    users.forEach(user => {
      let row = userTableBody.insertRow();
      let usernameCell = row.insertCell(0);
      let emailCell = row.insertCell(1);
      let actionCell = row.insertCell(2);

      usernameCell.textContent = user.username;
      emailCell.textContent = user.email;
      actionCell.innerHTML = `<button onclick="editUser(${user.id})"><i class="fa fa-edit"></i> Edit</button>
                              <button onclick="deleteUser(${user.id})"><i class="fa fa-trash"></i> Delete</button>`;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function createUser() {
  const username = document.getElementById("create-username").value;
  const email = document.getElementById("create-email").value;
  const password = document.getElementById("create-password").value;

  try {
    const response = await fetch(`${backendUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
      showUserManagement();
    } else {
      console.error("Error creating user:", response.status);
    }
  } catch (error) {
    console.error("Error creating user:", error);
  }
}

async function editArticle(articleId) {
  showCreateArticleForm(); // Show the edit form
  document.getElementById("edit-article-id").value = articleId;

  try {
    const response = await fetch(`${backendUrl}/articles/${articleId}`);
    const article = await response.json();

    document.getElementById("edit-article-title").value = article.title;
    document.getElementById("edit-article-content").value = article.content;
    // Image loading would be handled here in a real application
  } catch (error) {
    console.error("Error fetching article:", error);
  }
}

function clearArticleForm() {
  document.getElementById("edit-article-id").value = "";
  document.getElementById("edit-article-title").value = "";
  document.getElementById("edit-article-content").value = "";
  document.getElementById("edit-article-image").value = ""; // Clear file input
}

async function submitArticle() {
  const title = document.getElementById("edit-article-title").value;
  const content = document.getElementById("edit-article-content").value;

  try {
    const response = await fetch(`${backendUrl}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title, content: content })
    });

    if (response.ok) {
      showArticleList();
    } else {
      console.error("Error creating article:", response.status);
    }
  } catch (error) {
    console.error("Error creating article:", error);
  }
}

async function updateArticle() {
  const articleId = document.getElementById("edit-article-id").value;
  const title = document.getElementById("edit-article-title").value;
  const content = document.getElementById("edit-article-content").value;

  try {
    const response = await fetch(`${backendUrl}/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title, content: content })
    });

    if (response.ok) {
      showArticleList();
    } else {
      console.error("Error updating article:", response.status);
    }
  } catch (error) {
    console.error("Error updating article:", error);
  }
}

async function deleteArticle() {
  const articleId = document.getElementById("edit-article-id").value;

  try {
    const response = await fetch(`${backendUrl}/articles/${articleId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showArticleList();
    } else {
      console.error("Error deleting article:", response.status);
    }
  } catch (error) {
    console.error("Error deleting article:", error);
  }
}

async function updateSelectedArticles() {
  const selectedCheckboxes = document.querySelectorAll('#article-table input[type="checkbox"]:checked');
  selectedCheckboxes.forEach(async (checkbox) => {
    const articleId = checkbox.value;
    // Implement update logic here, possibly redirecting to an edit page
    console.log(`Update article: ${articleId}`);
  });
}

async function deleteSelectedArticles() {
  const selectedCheckboxes = document.querySelectorAll('#article-table input[type="checkbox"]:checked');
  for (const checkbox of selectedCheckboxes) {
    const articleId = checkbox.value;
    try {
      const response = await fetch(`${backendUrl}/articles/${articleId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.error(`Error deleting article ${articleId}:`, response.status);
      }
    } catch (error) {
      console.error(`Error deleting article ${articleId}:`, error);
    }
  }
  populateArticleList(); // Refresh the list after deletion
}

function sanitizeInput(input) {
  // Basic XSS protection (improve this significantly in a real application)
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}