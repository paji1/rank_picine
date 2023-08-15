document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch('/search'); // Replace with the actual endpoint
  const gridData = await response.json();


  const mapContainers = {
    map1: document.getElementById('map1'),
    map2: document.getElementById('map2'),
    map3: document.getElementById('map3')
  };

  // Default image source for cells with null values
  const defaultImageSrc = './img/default.avif'; // Replace with your default image path
  const searchResultsElement = document.getElementById('searchResults');
  const searchBar = document.getElementById('searchBar');

  for (const mapName in gridData) {
    const mapContainer = mapContainers[mapName];
    const map = gridData[mapName];

    let rn = 0;
    map.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      rowDiv.classList.add(`rn-${rn}`);

      let cn = 0;
      row.forEach(cell => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('map-cell');
        cellDiv.classList.add(`cn-${cn}`);
        
        let un = 0;
        cell.forEach(user => {
          const img = document.createElement('img');
          img.src = user?.user?.image?.versions?.small
          ? user.user.image.versions.small
          : defaultImageSrc;
          img.classList.add('user-image');
          img.classList.add(`un-${un}`);
          img.title = `${user?.user?.usual_full_name}\ncolumn ${cn + 1 } row ${rn + 1}\n      ${mapName.toUpperCase()}`;

          img.addEventListener('mouseenter', () => {
            img.classList.add('hovered');
          });
  
          img.addEventListener('mouseleave', () => {
            img.classList.remove('hovered');
          });
          img.addEventListener('click', (event) => {
            const url = 'https://profile.intra.42.fr/users/' + user?.user?.login; // Replace with your desired URL

            window.open(url, "_blank")?.focus();

          });
  
          cellDiv.appendChild(img);
          un++;
        });

        rowDiv.appendChild(cellDiv);
        cn++;
      });

      mapContainer.appendChild(rowDiv);
      rn++;
    });
  }

  function applyBorderAndColor(img, user, rn , cn , un, imgtmp) {
    // console.log(user);
    // console.log(user?.user?.login.toLowerCase().includes(searchBar?.value.toLowerCase()));
    if (
      user?.user?.login.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
      user?.user?.first_name.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
      user?.user?.last_name.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
      user?.user?.usual_full_name?.toLowerCase().includes(searchBar?.value.toLowerCase())
    ) {
      // console.log(img.classList);
      imgtmp = { rn , cn, un};
      img?.classList?.add('search-border');
    }
  }

  searchBar?.addEventListener('input', () => {

    const images = document.querySelectorAll('.user-image');
    images.forEach(img => {
      img.classList.remove('search-border');
    });
    const searchValue = searchBar.value.trim(); // Remove leading and trailing whitespace
    if (searchValue === "") {
      return; // Do nothing if search is empty
    }

    let imgtmp = { rn: -1, cn: -1, un: -1 };
    for (const mapName in gridData) {
      const map = gridData[mapName];
      map.forEach((row, rn) => {
        row.forEach((cell, cn) => {
          cell.forEach((user, un) => {
            if (user?.user) {
              const idcon = document.querySelector(`#${mapName}`);
              const img = idcon?.querySelector(`.rn-${rn} .cn-${cn} .un-${un}`);
              if (
                user?.user?.login.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
                user?.user?.first_name.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
                user?.user?.last_name.toLowerCase().includes(searchBar?.value.toLowerCase()) ||
                user?.user?.usual_full_name?.toLowerCase().includes(searchBar?.value.toLowerCase())
              ) {
                // console.log(img.classList);
                imgtmp = { rn , cn,   un};
                img?.classList?.add('search-border');
              }
              
            }
          });
        });
      });
    }
    const searchBorderElements = document.querySelectorAll('.search-border');
    const numberOfSearchBorderElements = searchBorderElements.length;
    if (numberOfSearchBorderElements === 1)
    {
      searchResultsElement.textContent = `column ${imgtmp?.cn + 1 } row ${imgtmp?.rn + 1}`;
    }
    else
    {
      searchResultsElement.textContent = '';
    }
  });
});
