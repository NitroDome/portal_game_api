# Portal Game API Documentation

Welcome to the Portal Game API, the central hub for interfacing between user interfaces and the intricate world of game asset management. This API is responsible for managing requests from the Portal API, ensuring seamless transactions within the Portal ecosystem.

## Endpoint Examples with Mock Data

Quick access to the API endpoints using mock data for initial testing:

-   **Check Wallet Connection**
    -   `GET [http://localhost:3001/api/game/isWalletConnected/0xABCDEF123456](http://localhost:3001/api/game/isWalletConnected/0xABCDEF123456)`
-   **Assign Wallet to User**
    -   Use a tool like Postman to make a `PUT` request to:
        -   `[http://localhost:3001/api/game/assignWalletToUser/0xDEF456ABC789](http://localhost:3001/api/game/assignWalletToUser/0xDEF456ABC789)`
    -   Request body:
        ```json
        {
            "username": 3jn3n3j33j,
            "password": 8432423122321321
        }
        ```
-   **Retrieve Contracts**
    -   `GET [http://localhost:3001/api/game/getContracts/2](http://localhost:3001/api/game/getContracts/2)`
-   **Get NFT Mapping**
    -   Use a tool like Postman to make a `POST` request to:
        -   `POST [http://localhost:3001/api/game/getNftMap/1](http://localhost:3001/api/game/getNftMap/1)`
    -   Request body:
        ```json
        [
            {
                “nftType”: 7,
                “tokenId”: 10,
                “contract”: “0x121313123113”,
                “chain”: “BASE”
            },
        ]
        ```
-   **Retrieve User Inventory**
    -   `GET [http://localhost:3000/api/getUserInventory/1/0xABC123DEF](http://localhost:3000/api/getUserInventory/1/0xABC123DEF)`
-   **Finalize Portal Transaction**
    -   Use a tool like Postman to make a `PUT` request to:
        -   `[http://localhost:3000/api/game/finalizePortalTransaction/1/0xDEF456ABC789](http://localhost:3000/api/game/finalizePortalTransaction/1/0xDEF456ABC789)`
    -   Request body:
        ```json
        {
            "extract"“extract”: [3,17,42],
            “inject”: [302, 15]
        }
        ```

## Overviews

The Portal Game API provides a suite of functionalities that allow for:

-   **Wallet Integration**: Services to check and assign wallet connections for users.
-   **NFT and Inventory Handling**: Mechanisms to retrieve user NFTs and in-game inventories, as well as to extract and inject assets.

## Components

-   **Portal API**: Interacts with the UI and handles requests, interfacing with the Portal DB and Portal Game API.
-   **Portal Game API**: Manages game-specific operations, including NFT minting, burning, and escrow.
-   **Portal Game DB**: Optionally used by game developers to manage game asset configurations.

## Key Terms

-   **Extract**: The process of converting in-game user inventory items into NFTs through the Portal.
-   **Inject**: The process of converting NFTs back into in-game user inventory items.

## Authentication

Access to the API endpoints requires a valid API key, which must be included in the header of every request.

## Base URL

The base URL for all API endpoints is:
http://localhost:3001/api/game

This base URL is utilized with the various endpoints outlined in subsequent sections of this documentation.

## Check Wallet Connection

Determines if the user's wallet is connected to the specified game. This endpoint is crucial for validating that a user's wallet address is recognized and authorized for gameplay, ensuring secure and personalized game interaction.

### Endpoint

GET /isWalletConnected/{walletAddress}

### Request Parameters

-   `walletAddress`: The user's wallet address. This parameter is part of the URL path.

### Response

A successful response will include an object indicating the connection status of the wallet:

```json
{
    "connected": true
}
```

### Curl Example

To check if a wallet is connected, use the following curl command, replacing WALLET_ADDRESS with the actual wallet address:

```sh
curl -X GET "http://localhost:3001/api/game/isWalletConnected/WALLET_ADDRESS" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Assign Wallet to User

Links the user's wallet to their account for the specified game. This endpoint is invoked when the wallet connection check (via `/isWalletConnected/{walletAddress}`) returns false, and the user needs to securely connect their wallet by logging in with their game credentials.

### Endpoint

POST /assignWalletToUser/{walletAddress}

### Request Parameters

-   `username`: The encrypted username of the user.
-   `password`: The encrypted password of the user.
-   `walletAddress`: The user's wallet address. This parameter is part of the URL path.

### Request Body

Include the username and password in the request body:

```json
{
    "username": "ENCRYPTED_USERNAME",
    "password": "ENCRYPTED_PASSWORD"
}
```

### Response

A successful response will include an object indicating whether the wallet was successfully linked to the user's account:

```json
{
    "success": true
}
```

### Curl Example

To assign a wallet to a user account, use the following curl command, replacing WALLET_ADDRESS, ENCRYPTED_USERNAME, and ENCRYPTED_PASSWORD with the actual values:

```sh
curl -X POST "http://localhost:3001/api/game/assignWalletToUser/WALLET_ADDRESS" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{"username": "ENCRYPTED_USERNAME", "password": "ENCRYPTED_PASSWORD"}'
```

## Retrieve Contracts for Allowed NFTs

Gets the contracts that have a mapping to game assets. This endpoint is called after a user connects their wallet and `isWalletConnected` returns true, allowing for the retrieval of contracts related to allowed NFTs.

### Endpoint

GET /getContracts/{levelId}

### Request Parameters

-   `levelId`: The game level for which to retrieve contracts.

### Response

A successful response returns an array of objects, each containing details about the contracts that are allowed to map to game assets:

```json
[
    {
        "contract": "0x121313123113",
        "chain": "BASE"
    }
]
```

### Curl Example

To retrieve contracts for allowed NFTs, use the following curl command, replacing LEVEL with the actual game level:

```sh
curl -X GET "http://localhost:3001/api/game/getContracts/LEVEL" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Retrieve NFTs Mapped to Game Assets

Retrieves the asset mapping for the list of NFTs received after the Portal API has parsed all NFTs for a connected user for a specific game and level.

### Endpoint

GET /getNftMap/{levelId}

### Request Parameters

-   `levelId`: The game level for which to retrieve contracts.

### Response

A successful response returns an array of objects, each detailing the game assets mapped to NFTs:

```json
[
    {
        "gameLevel": 1,
        "itemId": 101,
        "name": "Magic Sword",
        "description": "A legendary sword imbued with mystical powers.",
        "nftType": 7,
        "quantity": 1,
        "quantityPerNft": 1,
        "tokenId": 10,
        "uri": "http://example.com/nft/101",
        "image": "http://example.com/nft/101/image.png",
        "chain": "BASE",
        "type": "ERC721_NFTType",
        "address": "0x121313123113"
    }
]
```

### Notes

Any NFTs that do not have a known mapping are not included in the response.

### Curl Example

To retrieve NFTs mapped to game assets for a specific level, use the following curl command, replacing LEVEL_ID with the actual level ID:

```sh
curl -X GET "http://localhost:3001/api/game/getNftMap/LEVEL_ID" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Retrieve User Inventory

Retrieves the user-owned inventory for a specific game level associated with a given wallet address. This endpoint is called after a user connects their wallet and `isWalletConnected` returns true, allowing for the retrieval of the user's inventory items that can potentially be converted into NFTs.

### Endpoint

GET /getUserInventory/{levelID}/{walletAddress}

### Request Parameters

-   `levelID`: The game level ID for which to retrieve the user's inventory.
-   `walletAddress`: The user's wallet address. Both parameters are part of the URL path.

### Response

A successful response returns an array of objects, each containing detailed information about each item in the user's inventory:

```json
[
    {
        "gameLevel": 1,
        "itemId": 102,
        "name": "Enchanted Shield",
        "description": "A shield that glows with a mystical light, offering protection against dark magic.",
        "nftType": 5,
        "quantity": 1,
        "quantityPerNft": 1,
        "uri": "http://example.com/nft/102",
        "image": "http://example.com/nft/102/image.png",
        "chain": "BASE",
        "type": "ERC721_NFTType",
        "address": "0x1987532aABCD",
        "canExtract": true
    }
]
```

### Notes

Each item's canExtract boolean indicates whether the item can be converted into an NFT, facilitating the extraction process for users who wish to port items into the blockchain.

### Curl Example

To retrieve the inventory for a specific game level and wallet address, use the following curl command, replacing LEVEL_ID and WALLET_ADDRESS with the actual values:

```sh
curl -X GET "http://localhost:3001/api/game/getUserInventory/LEVEL_ID/WALLET_ADDRESS" \
     -H "Authorization: Bearer YOUR_API_KEY"
```

## Finalize a Portal Transaction

Finalizes a pending portal transaction after it is confirmed on the blockchain. This process involves updating the user's game inventory by adding or removing items, as well as minting or transferring NFTs to the user, depending on the transaction details.

### Endpoint

PUT /finalizePortalTransaction/{levelID}/{walletAddress}

### Request Parameters

-   `levelID`: The game level ID associated with the transaction.
-   `walletAddress`: The user's wallet address. Both parameters are part of the URL path.

### Request Body

Provide the IDs of items to extract from or inject into the user's game inventory:

```json
{
    "extract": [3, 17, 42],
    "inject": [302, 15]
}
```

### Response

A successful response indicates whether the transaction was completed successfully:

```json
{
    "finalized": true
}
```

### Notes

The extract array contains item IDs that are to be removed from the user's game inventory for the specified level and minted as NFTs. If the NFTs are held in escrow rather than being newly minted, they will be transferred to the user.
The inject array contains item IDs that are to be added to the user's game inventory for the specified level.

### Curl Example

To finalize a portal transaction for a specific game level and wallet address, use the following curl command, replacing LEVEL_ID and WALLET_ADDRESS with the actual values:

```sh
curl -X PUT "http://localhost:3001/api/game/finalizePortalTransaction/LEVEL_ID/WALLET_ADDRESS" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -d '{"extract": [3, 17, 42], "inject": [302, 15]}'
```
