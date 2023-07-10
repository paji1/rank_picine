
const fs = require('fs');

// Read the JSON data from the file
const jsonData = fs.readFileSync('usersData.json', 'utf8');
const cursusData = JSON.parse(jsonData);

// Create a table to store the login, level, and image fields
const table = [];
// table.push(['Login', 'Level', 'Image']);

// Iterate over each object in the cursusData array
for (const cursus of cursusData) {
  const login = cursus.user.login;
  const level = cursus.level;
  var image = cursus.user.image.versions.small;
  if (image == null)
    image = "https://img.freepik.com/free-icon/user_318-563642.jpg";
  if (login.startsWith('3b3') || login == "ahboukha") {
	// Add the login and example values to the table
	continue;
	
  }
  // Add the login, level, and image values to the table
  table.push([login, level, image]);
}

// Generate the HTML content
const htmlContent = `
<html>
<head>
<style>
body {
  background-color: #f2f2f2;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}
.table-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  background-color: #2c3e50;
  color: #fff;
  padding: 10px;
  text-align: left;
}
td {
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
tr:nth-child(even) {
  background-color: #f9f9f9;
}
/* CSS for hover effect */
tr {
  position: relative;
  transition: background-color 0.3s;
}

tr:hover {
  background-color: #f9f9f9;
}

tr:hover td {
  color: #333;
}

tr:hover img {
  transform: scale(1.1);
  transition: transform 0.3s;
}
td.login:hover {
  color: #333;
  font-weight: bold;
  cursor: pointer;
}
img {
  max-width: 50px;
  max-height: 50px;
  border-radius: 50%;
}
</style>
</head>
<body>
<div class="table-container">
  <table>
    <tr>
      <th>Login</th>
      <th>Level</th>
      <th>Image</th>
    </tr>
    ${table
      .map(
        ([login, level, image]) => `
      <tr onclick="redirectTo('https://profile.intra.42.fr/users/${login}')">
        <td class="login">${login}</td>
        <td>${level}</td>
        <td><img src="${image}" alt="${login}"></td>
      </tr>
    `
      )
      .join('')}
  </table>
  <script>
function redirectTo(url) {
  window.location.href = url;
}
</script>
  </div>
</body>
</html>
`;

// Write the HTML content to a file
fs.writeFileSync('index.html', htmlContent);

console.log('HTML file created successfully.');
