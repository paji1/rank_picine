$(document).ready(() => {
  const tbody = $('#userTable tbody');
  let pageLimit = 1;
  let fetchedUsers = [];
  let i = 0;

  const loadingIndicator = $('#loadingIndicator');

  function fetchUsers() {
    console.log("first");
    $.get(`https://server-bjte.onrender.com/fetch`, (response) => {
      const users = response;
      users.forEach(function (user) {
        i++;
        const level = user.level;
        const login = user.user.login;
        var image_link = user.user.image.versions.small;
        if (image_link == null)
        {
          image_link = "https://img.freepik.com/free-icon/user_318-563642.jpg";

        }

        
        const tr = $('<tr>').click(() => {
          const url = 'https://profile.intra.42.fr/users/' + login; // Replace with your desired URL
          redirectTo(url);
        });
        const i_Td = $('<td>').text(i);
        const loginTd = $('<td>').text(login).addClass('login');
        const levelTd = $('<td>').text(level);
        const imageTd = $('<td>').append($('<img>').attr('src', image_link));
        
        if (!fetchedUsers.includes(i)) {
          fetchedUsers.push(i);
          
        tr.append(i_Td, loginTd, levelTd, imageTd);
        tbody.append(tr);
      }
      });
    })
  }




  // Initial fetch
  fetchUsers();
});

function redirectTo(url) {
  window.location.href = url;
}
