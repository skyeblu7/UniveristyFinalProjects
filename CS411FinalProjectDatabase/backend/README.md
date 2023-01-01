Type `npm install` to install the dependencies needed to run this project.

`node server.js` to start the server using local database on port 80.

## `.ENV` File for Secret Key

The `.env` file is used to store the secret key for the application. The secret key is used to sign the JWT token. The `.env` file is not included in the repository. You will need to create your own `.env` file in the root directory of the project. The `.env` file should contain the following:



## APIs

|   Method   |            URI            |    Parameters (as JSON string)   |    RESULT    |
| -----------| -------------------------- | ----------------- | ------------ |
|   GET      |  api/cards          |  empty  |  get all cards |
| GET   | api/cards/:id  |  card id | get card by id |
| GET | api/cards?title=[kw] | keyword | get a list of cards sorted by keyword |
| DELETE | api/cards/:id | card id | delete card with specified id |
| POST | api/cards | card data | add new card |
| PUT | api/cards/:id | id and new data | update card with specified id using new data |