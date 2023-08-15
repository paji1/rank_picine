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

  const confirmationDialog = $('#confirmationDialog');
  const confirmBtn = $('#confirmBtn');
  const cancelBtn = $('#cancelBtn');
  const closePopup = $('.close-popup');

  // Show pop-up dialog
  function showPopup(username) {

    const message = `Add <strong>${username}</strong> to the map?`;
    $('#popupMessage').html(message);
    confirmationDialog.css('display', 'block');
  }

  // Hide pop-up dialog
  function hidePopup() {
    confirmationDialog.css('display', 'none');
  }



  // Handle Cancel button click
  cancelBtn.click(() => {
    hidePopup();
  });

  // Handle close button click
  closePopup.click(() => {
    hidePopup();
  });
  function setProfileData(username, profileImage) {
    $('#profileUsername').text(username);
    $('#profileImage').attr('src', profileImage);
  }

  // Fetch profile data
  fetch('http://localhost/profile')
    .then(response => response.json())
    .then(data => {
      const { username, profileLink, profileImage } = data;
      setProfileData(username, profileImage);

      // Link the username to the profile link
      $('#profileUsername').wrap($('<a>').attr('href', profileLink));
    })
    .catch(error => {
      console.error('Error fetching profile data:', error);
    });
  $('#toggleSearchBtn').click(() => {
    $('#searchInput').toggle();
  });

  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');

  const tbody = $('#userTable tbody');
  let pageLimit = 1;
  let usersData = []; // Declare usersData globally

  function fetchUsers() {
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
              image_link = "./img/default.avif";
            }

            const tr = $('<tr>');

            tr.empty();


            const loginTd = $('<td>')
              .text(login)
              .addClass('login')
              .click(() => {
                const url = 'https://profile.intra.42.fr/users/' + login; // Replace with your desired URL
                redirectTo(url);
              });
            const i_Td = $('<td>').text(i);
            const levelTd = $('<td>').text(level);
            const imageTd = $('<td>').append($('<img>').attr('src', image_link));
            const addButton = $('<button>')
              .text('Add')
              .addClass('add-button')
              .click(() => {
                showPopup(login);

                confirmBtn.off('click').on('click', () => {

                  fetch('http://localhost/add', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json' // Make sure this header is set
                    },
                    body: JSON.stringify({ user: user })
                  }).then(response => response.json())
                    .then(data => {
                      console.log(data.message);
                    })
                    .catch(error => {
                      console.error('Error:', error);
                    });

                  // Handle the add action here
                  // You can make an API call to add the user data to the server

                  // Optionally, you can disable the button after adding
                  // addButton.prop('disabled', true);
                  tr.remove();
                  
                  usersData = usersData.filter(user => user.user.login !== login);
                  hidePopup();
                });

                cancelBtn.off('click').on('click', () => {
                  hidePopup();
                });

                closePopup.off('click').on('click', () => {
                  hidePopup();
                });
              });
            const buttonTd = $('<td>').append(addButton);



            user.id = i;
            usersData.push(user);
            fetchedatalogin.push(login);
            tr.append(i_Td, loginTd, levelTd, imageTd, buttonTd);
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
    // if (searchTerm.length > 0) {
    filterUsers(searchTerm);
    // }
  });

  function filterUsers(searchTerm) {
    let fetchedUsers = [];
    // Clear the table body
    tbody.empty();

    // Filter the users based on the search term
    const filteredUsers = usersData.filter(user => {
      const name = user.user.login.toLowerCase();
      const firstName = user.user.first_name.toLowerCase();
      const lastName = user.user.last_name.toLowerCase();
      const usual_full_name = user.user.usual_full_name.toLowerCase();
      return (
        name.includes(searchTerm) ||
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        usual_full_name.includes(searchTerm) 
      );
    });
    // Render the filtered users in the table
    filteredUsers.forEach((user, index) => {
      const login = user.user.login;
      const level = roundNumber(user.level, 2);

      let image_link = user.user.image.versions.small;
            if (image_link == null) {
              image_link = "./img/default.avif";
            }
      if (!fetchedUsers.includes(login)) {
        const tr = $('<tr>');

        tr.empty();


        const loginTd = $('<td>')
          .text(login)
          .addClass('login')
          .click(() => {
            const url = 'https://profile.intra.42.fr/users/' + login; // Replace with your desired URL
            redirectTo(url);
          });
        const levelTd = $('<td>').text(level);
        const i_Td = $('<td>').text(user.id);
        const imageTd = $('<td>').append($('<img>').attr('src', image_link));
        const addButton = $('<button>')
          .text('Add')
          .addClass('add-button')
          .click(() => {
            showPopup(login);

            confirmBtn.off('click').on('click', () => {

              fetch('http://localhost/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json' // Make sure this header is set
                },
                body: JSON.stringify({ user: user })
              }).then(response => response.json())
                .then(data => {
                  console.log(data.message);
                })
                .catch(error => {
                  console.error('Error:', error);
                });
              
              // Handle the add action here
              // You can make an API call to add the user data to the server

              // Optionally, you can disable the button after adding
              // addButton.prop('disabled', true);
              tr.remove();
              hidePopup();
            });

            cancelBtn.off('click').on('click', () => {
              hidePopup();
            });

            closePopup.off('click').on('click', () => {
              hidePopup();
            });
          });
        const buttonTd = $('<td>').append(addButton);
        fetchedUsers.push(login);

        tr.append(i_Td, loginTd, levelTd, imageTd, buttonTd);
        tbody.append(tr);
        console.log("sone");
      }
    });

    // Show or hide the search results pop-up
  }

  // Initial fetch
  fetchUsers();
});
