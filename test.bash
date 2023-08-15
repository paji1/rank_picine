#!/bin/bash

# Read and process each object in userData.json
jq -c '.[]' usersData.json | while IFS= read -r userObject; do
    # Send the POST request using curl
  curl -X POST -H "Content-Type: application/json" -d '{"user":'"$userObject"'}' http://localhost/add
done