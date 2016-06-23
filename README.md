# commitMap
#### location based github commit mapping
### Description
commitMap is an application providing GitHub users with location data about where they push from. A user selects a list of repos to watch from their public github repos.

commitMap requires an iPhone with a companion app installed. User settings can be modified and viewed through the web or mobile client. The backend of this application will handle all data storage and API routes required.

when a user pushes to one of the selected repos, the server backend will receive notification. Using timestamps for comparison, the github event and the location data from the mobile client will be linked.

### Technologies
* Node.js, Express, PostgreSQL, backend
* Cordova/Ionic iOS app
* Angular.js, CSS, HTML, jQuery web front end

### MVP
* Authentication through GitHub for profile creation
* Local Authentication using app specific username/password
* GitHub web hook creation after selecting public repos.
* Location information based on push events

### Nice to Haves / Stretch Goals
* basic map displaying commits using the google maps API
* user Profile with various github information# murphy_node_template
