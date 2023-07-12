let fetchedatalogin = [];
let i = 0;
function redirectTo(url) {
  window.location.href = url;
}
function roundNumber(number, precision) {
  const factor = Math.pow(10, precision);
  const roundedValue = Math.round(number * factor) / factor;
  return roundedValue.toFixed(precision);
}
$(document).ready(() => {
  $('#toggleSearchBtn').click(() => {
    $('#searchInput').toggle();
  });
  
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  
  const tbody = $('#userTable tbody');
  let pageLimit = 1;
  let usersData = []; // Declare usersData globally
  
  function fetchUsers() {
    console.log("first");
    fetch('http://localhost/fetch')
    .then(response => response.json())
    .then(data => {
      const users = data;
      usersData = []; // Clear the existing user data
      
      users.forEach(function (user) {
        i++;
        const login = user.user.login;

        if (!usersData.includes(login)) {
          const level = roundNumber(user.level, 2);
          let image_link = user.user.image.versions.small;
          if (image_link == null) {
            image_link = "https://img.freepik.com/free-icon/user_318-563642.jpg";
          }
          
          const tr = $('<tr>').click(() => {
            const url = 'https://profile.intra.42.fr/users/' + login; // Replace with your desired URL
            redirectTo(url);
          });
          tr.empty();
          const i_Td = $('<td>').text(i);
          const loginTd = $('<td>').text(login).addClass('login');
          const levelTd = $('<td>').text(level);
          const imageTd = $('<td>').append($('<img>').attr('src', image_link));
          
          usersData.push(user);
          fetchedatalogin.push(login);
          tr.append(i_Td, loginTd, levelTd, imageTd);
          tbody.append(tr);
        }
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  searchInput.on('input', () => {
    const searchTerm = searchInput.val().trim().toLowerCase();
    if (searchTerm.length > 0) {
      filterUsers(searchTerm);
    }
  });

  function filterUsers(searchTerm) {
    // Clear the table body
    tbody.empty();
    let fetchedUsers = [];

    // Filter the users based on the search term
    console.log(usersData);
    const filteredUsers = usersData.filter(user => {
      const name = user.user.login.toLowerCase();
      const firstName = user.user.first_name.toLowerCase();
      const lastName = user.user.last_name.toLowerCase();
      return (
        name.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm)
      );
    });
    // Render the filtered users in the table
    filteredUsers.forEach((user, index) => {
      const login = user.user.login;
      const level = roundNumber(user.level, 2);

      const image_link = user.user.image.versions.small;

      if (!fetchedUsers.includes(login)) {
        const tr = $('<tr>').click(() => {
          const url = 'https://profile.intra.42.fr/users/' + login; // Replace with your desired URL
          redirectTo(url);
        });
        const i_Td = $('<td>').text(index + 1);
        const loginTd = $('<td>').text(login).addClass('login');
        const levelTd = $('<td>').text(level);
        const imageTd = $('<td>').append($('<img>').attr('src', image_link));
        fetchedUsers.push(login);

        tr.append(i_Td, loginTd, levelTd, imageTd);
        tbody.append(tr);
        console.log("sone");
      }
    });

    // Show or hide the search results pop-up
  }

  // Initial fetch
  fetchUsers();
});
