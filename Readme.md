# Portal API Documentation

Welcome to the Portal API, the central hub for interfacing between user interfaces and the intricate world of game asset management. This API is responsible for managing requests from the UI, facilitating communication with the Portal Game API, and ensuring seamless transactions within the Portal ecosystem.

## Endpoint Examples with Mock Data

Quick access to the API endpoints using mock data for initial testing:

- **Retrieve Games and Levels**
  - `GET [http://localhost:3000/api/games](http://localhost:3000/api/games)`
- **Check Wallet Connection**
  - `GET [http://localhost:3000/api/games/isWalletConnected/1/0x123456789abcdef](http://localhost:3000/api/games/isWalletConnected/1/0x123456789abcdef)`
- **Retrieve User NFTs**
  - `GET [http://localhost:3000/api/games/getUserNFTs/1/1/0xABC123DEF](http://localhost:3000/api/games/getUserNFTs/1/1/0xABC123DEF)`
- **Retrieve User Inventory**
  - `GET [http://localhost:3000/api/games/getUserInventory/1/1/0xABC123DEF](http://localhost:3000/api/games/getUserInventory/1/1/0xABC123DEF)`
- **Retrieve Portal Transaction History**
  - `GET [http://localhost:3000/api/games/getTransactions/0x123ABC456DEF](http://localhost:3000/api/games/getTransactions/0x123ABC456DEF)`
- **Submit Portal Transactions**
  - Use a tool like Postman to make a `PUT` request to:
    - `[http://localhost:3000/api/games/submitPortalTransaction/1/0xABC123DEF](http://localhost:3000/api/games/submitPortalTransaction/1/0xABC123DEF)`
- **Cancel Portal Transaction**
  - Use a tool like Postman to make a `PUT` request to:
    - `[http://localhost:3000/api/cancelPortalTransaction/123](http://localhost:3000/api/cancelPortalTransaction/123)`

## Overview

The Portal API provides a suite of functionalities that allow for:

- **Management of Games and Levels**: Interface to retrieve and manage games and their levels.
- **Wallet Integration**: Services to check and assign wallet connections for users.
- **NFT and Inventory Handling**: Mechanisms to retrieve user NFTs and in-game inventories, as well as to extract and inject assets.
- **Transaction Tracking**: Endpoints to submit, cancel, and retrieve the history of portal transactions.

## Components

- **Portal API**: Interacts with the UI and handles requests, interfacing with the Portal DB and Portal Game API.
- **Portal Game API**: Manages game-specific operations, including NFT minting, burning, and escrow.
- **Portal DB**: Stores data about games, levels, and portal transactions.
- **Portal Game DB**: Optionally used by game developers to manage game asset configurations.

## Key Terms

- **Extract**: The process of converting in-game user inventory items into NFTs through the Portal.
- **Inject**: The process of converting NFTs back into in-game user inventory items.

## Getting Started

To integrate with the Portal API, you need:

- A user interface capable of making HTTP requests to the API.
- A system to handle user wallets and blockchain interactions.

## Authentication

Access to the API endpoints requires a valid API key, which must be included in the header of every request.

## Base URL

The base URL for all API endpoints is:
http://localhost:3000/api

This base URL is utilized with the various endpoints outlined in subsequent sections of this documentation.

## Retrieve Games and Levels

Retrieves a comprehensive list of available games and their associated levels from the Portal DB. This endpoint provides essential information for users to initialize and navigate through the different gaming options.

### Endpoint
GET /api/getGames

### Request Headers

No additional headers required for this endpoint besides the standard authentication headers.

### Response

A successful response will include an array of game objects, each containing details about the game and its levels:

```json
[
  {
    "gameID": 1,
    "gameName": "Space Explorer",
    "gameDescription": "Explore the vast universe and discover new planets.",
    "gameBanner": "url-to-game-banner-image",
    "levels": [
      {
        "levelId": 1,
        "levelName": "Beginner",
        "levelDescription": "Learn the basics of space travel.",
        "isDefault": true
      },
      {
        "levelId": 2,
        "levelName": "Advanced",
        "levelDescription": "Take on challenging missions.",
        "isDefault": false
      }
      // Additional levels as necessary
    ]
  },
  {
    "gameID": 2,
    "gameName": "Dungeon Crawler",
    "gameDescription": "Navigate deep dungeons and defeat ancient monsters.",
    "gameBanner": "url-to-game-banner-image",
    "levels": [
      {
        "levelId": 1,
        "levelName": "Entry",
        "levelDescription": "Enter the dungeons' depths.",
        "isDefault": true
      },
      {
        "levelId": 2,
        "levelName": "Deep Dive",
        "levelDescription": "Explore the darkest corners of the dungeon.",
        "isDefault": false
      }
      // Additional levels as necessary
    ]
  }
  // Additional games as necessary
]
```
### Curl Example

To retrieve the list of games and levels, use the following curl command:

```bash
curl -X GET "http://localhost:3000/api/getGames" \
     -H "Authorization: Bearer YOUR_API_KEY"
```
## Check Wallet Connection

Determines if a user's wallet is connected to a specific game. This verification helps to ascertain if a user can proceed with game-related transactions.

### Endpoint
GET /api/isWalletConnected/{gameID}/{walletAddress}

### URL Parameters

- **gameID**: The ID of the selected game.
- **walletAddress**: The wallet address to be checked for a connection.

### Request Headers

No additional headers required for this endpoint besides the standard authentication headers.

### Response

A successful response will include an object indicating whether the wallet is connected:

```json
{
  "gameID": 1,
  "walletAddress": "0xABC123DEF...",
  "connected": true
}
```
The connected field is a boolean that will be true if the wallet is connected to the user account in the specified game, or false otherwise.

### Curl Example
To check the wallet connection, use the following curl command:
```sh
curl -X GET "http://localhost:3000/api/isWalletConnected/1/0xABC123DEF..." \
     -H "Authorization: Bearer YOUR_API_KEY"
```
Replace 1 with the actual game ID, 0xABC123DEF... with the actual wallet address, and YOUR_API_KEY with your valid API key to authenticate the request.

## Assign Wallet to User

Links a user's wallet to their account for a specified game. This operation is typically performed when a new wallet connection is established or when a user wishes to change their associated wallet.

### Endpoint

POST /api/assignWalletToUser/{gameID}/{walletAddress}


### URL Parameters

- **gameID**: The ID of the game for which the wallet will be assigned.
- **walletAddress**: The user's wallet address to be linked with their game account.

### Request Headers

Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

### Request Body

The request must include the user's encrypted username and password:

```json
{
  "username": "encryptedUsername",
  "password": "encryptedPassword"
}
```
### Response
A successful response indicates that the wallet has been assigned:
```json
{
  "success": true,
  "message": "Wallet successfully assigned to user."
}
```
If unsuccessful, the response should provide an appropriate error message.

### Curl Example
To assign a wallet to a user's game account, use the following curl command:
```sh
curl -X POST "http://localhost:3000/api/assignWalletToUser/1/0xABC123DEF..." \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{
           "username": "encryptedUsername",
           "password": "encryptedPassword"
         }'
```
Ensure you replace 1 with the actual game ID, 0xABC123DEF... with the user's wallet address, encryptedUsername and encryptedPassword with the user's credentials, and YOUR_API_KEY with a valid API key.

### Notes
The username and password should be encrypted according to the security standards adopted by your system.
The actual endpoint implementation must validate the provided credentials and ensure that the wallet address is not already associated with another user account.

## Retrieve User NFTs

Retrieves all NFTs owned by a user for a specific game and level. This endpoint queries the Portal Game API to get the NFTs associated with the user's wallet that are relevant to the selected game.

### Endpoint
GET /api/getUserNFTs/{gameID}/{levelID}/{walletAddress}

### URL Parameters

- **gameID**: The ID of the selected game.
- **levelID**: The ID of the selected level within the game.
- **walletAddress**: The wallet address of the user.

### Request Headers

Authorization: Bearer YOUR_API_KEY

### Response

The response will be an array of objects, each containing the details of an NFT owned by the user:

```json
[
  {
    "itemId": 1,
    "name": "Starlight Sword",
    "description": "A sword forged from celestial stars, granting the wielder unmatched power.",
    "nftType": 721,
    "quantity": 1,
    "tokenId": "123456789",
    "uri": "https://example.com/nft/starlight-sword",
    "image": "https://example.com/images/nft/starlight-sword.png",
    "chain": "Ethereum",
    "type": "ERC721",
    "address": "0x1111111111111111111111111111111111111111"
  }
  // ... other NFTs
]
```
### Curl Example
To retrieve the user's NFTs, use the following curl command:
```sh
curl -X GET "http://localhost:3000/api/getUserNFTs/1/1/0xABC123DEF..." \
     -H "Authorization: Bearer YOUR_API_KEY"
```
Replace 1 for both gameID and levelID with their actual values, 0xABC123DEF... with the user's wallet address, and YOUR_API_KEY with your valid API key.

### Notes
It is essential to verify that the wallet address provided matches an authenticated user to prevent unauthorized access to another user's NFTs.
Ensure all communication is done over HTTPS to protect the sensitive data in transit.

## Retrieve User Inventory

Fetches the current in-game inventory for a user, based on their wallet address, for a specific game and level. This allows users to view their items that can be portaled to NFTs.

### Endpoint

GET /api/getUserInventory/{gameID}/{levelID}/{walletAddress}

### URL Parameters

- **gameID**: The ID of the game for which inventory is being requested.
- **levelID**: The level within the game for which inventory is being requested.
- **walletAddress**: The wallet address associated with the user's game account.

### Request Headers

Authorization: Bearer YOUR_API_KEY

### Response

A successful response will include an array of inventory items, each with detailed information:

```json
[
  {
    "itemId": 101,
    "name": "Elixir of Vigor",
    "description": "A potion that restores 20 HP.",
    "nftType": 1,
    "quantity": 3,
    "uri": "https://example-game.com/inventory/elixir-of-vigor",
    "image": "https://example-game.com/images/items/elixir-of-vigor.png",
    "chain": "Ethereum",
    "type": "ERC1155",
    "address": "0x
```
### Curl Example
To retrieve the user's inventory for a specific game and level, use the following curl command:
```sh
curl -X GET "http://localhost:3000/api/getUserInventory/1/1/0xABC123DEF..." \
     -H "Authorization: Bearer YOUR_API_KEY"
```
Replace 1 for both gameID and levelID with their actual values, 0xABC123DEF... with the user's wallet address, and YOUR_API_KEY with the provided API key.

### Notes
The wallet address must correspond to an authenticated user to ensure the privacy and security of user data.
The response includes whether each item can be extracted to an NFT, providing users with clarity on which items are eligible for portaling.

## Retrieve Portal Transaction History

Fetches a summary of all portal transactions for a user, detailing each transaction's status, items involved, and timestamps. This endpoint provides a comprehensive view of a user's interactions with the portal system.

### Endpoint
GET /api/getTransaction/{walletAddress}

### URL Parameters

- **walletAddress**: The wallet address of the user whose transaction history is being retrieved.

### Request Headers

Authorization: Bearer YOUR_API_KEY

### Response

A successful response will include an array of transaction records:

```json
[
  {
    "Datetime": "2024-04-10T14:30:00Z",
    "TxID": 123,
    "Game": "Space Explorer",
    "Level": "Orbit Maneuvers",
    "Status": "Completed",
    "Injected": ["Starship Shield", "Photon Cannon"],
    "Extracted": ["Photon Blaster", "Comet Dust"],
    "walletAddress": "0x123ABC456DEF"
  },
  {
    "Datetime": "2024-04-12T09:15:00Z",
    "TxID": 124,
    "Game": "Dungeon Crawler",
    "Level": "Labyrinth Escape",
    "Status": "Failed",
    "Injected": ["Ancient Map", "Healing Potion", "Shard of Light"],
    "Extracted": [],
    "walletAddress": "0x123ABC456DEF"
  }
  // Additional transactions as necessary
]
```
### Curl Example
To retrieve the transaction history for a user, use the following curl command:
```sh
curl -X GET "http://localhost:3000/api/getTransaction/0xABC123DEF..." \
     -H "Authorization: Bearer YOUR_API_KEY"
```
Replace 0xABC123DEF... with the actual wallet address of the user and YOUR_API_KEY with a valid API key.

### Notes
Ensure that the wallet address corresponds to an authenticated user to maintain the privacy and security of transaction data.
Review each transaction for its status and details to provide users with accurate and timely support regarding their portal interactions.
## Submit Portal Transaction

Submits a portal transaction for injecting and extracting NFTs. This transaction is submitted before the blockchain transaction to create a record in the Portal DB that will be used to confirm the validity of the portal transaction once the blockchain transaction is complete.

### Endpoint

PUT /api/games/submitPortalTransaction/{gameID}/{levelID}/{walletAddress}

### URL Parameters

- **gameID**: The ID of the game.
- **levelID**: The ID of the level associated with the game.
- **walletAddress**: The wallet address of the user submitting the transaction.

### Request Headers

Content-Type: application/json
### Request Body Example

```json
{
  "extract": [
    {
      "itemId": 301,
      "name": "Quantum Oscillator",
      "description": "An essential tool for manipulating quantum states.",
      "nftType": 123,
      "chain": "Ethereum",
      "type": "ERC721_NFTType",
      "address": "0x123456789ABCDEF"
    }
  ],
  "inject": [
    {
      "itemId": 302,
      "name": "Galactic Compass",
      "description": "Guides the bearer through the cosmos.",
      "nftType": 234,
      "chain": "Ethereum",
      "type": "ERC721_NFTType",
      "address": "0x234567890ABCDEF",
      "tokenId": 10,
      "contract": "0x121313123113"
    }
  ]
}
```
### Curl Example

To submit a portal transaction, use the following `curl` command:

```bash
curl -X PUT "http://localhost:3000/api/games/submitPortalTransaction/1/1/0xABC123DEF" \
     -H "Content-Type: application/json" \
     -d '{
           "extract": [
             {
               "itemId": 301,
               "name": "Quantum Oscillator",
               "description": "An essential tool for manipulating quantum states.",
               "nftType": 123,
               "chain": "Ethereum",
               "type": "ERC721_NFTType",
               "address": "0x123456789ABCDEF"
             }
           ],
           "inject": [
             {
               "itemId": 302,
               "name": "Galactic Compass",
               "description": "Guides the bearer through the cosmos.",
               "nftType": 234,
               "chain": "Ethereum",
               "type": "ERC721_NFTType",
               "address": "0x234567890ABCDEF",
               "tokenId": 10,
               "contract": "0x121313123113"
             }
           ]
         }'
```
## Cancel Portal Transaction

Allows users to cancel a pending portal transaction. This endpoint is critical for managing transactions that have not yet been finalized on the blockchain, providing users with the ability to stop operations before they complete.

### Endpoint
PUT /api/cancelPortalTransaction/{txID}

### URL Parameters

- **txID**: The unique transaction ID of the portal transaction to be canceled.

### Request Headers

Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

### Response

The response will confirm whether the transaction was successfully canceled:

```json
{
  "success": true,
  "message": "Transaction canceled successfully."
}
```
If the transaction cannot be found or is already finalized, the response should appropriately reflect the error:
```json
{
  "success": false,
  "message": "Transaction cannot be canceled or not found."
}
```
### Curl Example
To cancel a portal transaction, use the following curl command:
```sh
curl -X PUT "http://localhost:3000/api/cancelPortalTransaction/123" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json"

```
Replace 123 with the actual transaction ID, and YOUR_API_KEY with a valid API key.

### Notes
This endpoint should be used cautiously as it affects the transaction status in the database.
Ensure all validations are in place to check the transaction's current status before proceeding with cancellation.
