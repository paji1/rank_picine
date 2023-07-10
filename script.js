const axios = require('axios');
const fs = require('fs');

const UID = 'u-s4t2ud-7125a98019064ca4d534fd584fae48ac8663a3cefbb1bbccf20165d9db545f32';
const SECRET = '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';

async function getAccessToken() {
  try {
    // @ts-ignore
    const response = await axios.post('https://api.intra.42.fr/oauth/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: UID,
        client_secret: SECRET
      }
    });

    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error('Failed to obtain access token');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function getUsers(accessToken, page = 1, perPage = 100) {
  const apiUrl = 'https://api.intra.42.fr/v2/cursus_users';
  
  try {
    // @ts-ignore
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        'filter[campus_id]': '16',
        'filter[cursus_id]': '9',
        'range[created_at]': '2023-01-01T13:41:00.750Z,2023-07-10T13:41:00.750Z',
        'sort': 'level',
        page,
        per_page: perPage
      }
    });
  
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const accessToken = await getAccessToken();
    const users = [];
    let page = 1;
    const perPage = 100;
  
    let response = await getUsers(accessToken, page, perPage);
    users.push(...response);
  
    while (response.length === perPage) {
      page++;
      response = await getUsers(accessToken, page, perPage);
      users.push(...response);
    }
  
    fs.writeFileSync('usersData.json', JSON.stringify(users));
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Usage example: Fetch all users using the provided UID and SECRET
getAllUsers();
