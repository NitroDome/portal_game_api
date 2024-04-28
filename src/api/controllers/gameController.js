const {
    nfts,
    userInventories,
    gameContracts,
    gameNFTMappings,
} = require("../../utils/mockData");

/**
 * Checks if a user's wallet is connected to a specified game.
 * @param {Request} req - The request object. Expects walletAddress in the URL.
 * @param {Response} res - The response object. Returns connection status.
 */
exports.isWalletConnected = (req, res) => {
    const { walletAddress } = req.params;

    // Mock response assuming connection status
    const isConnected = Math.random() > 0.5; // Randomly decides true or false for demonstration

    res.json({
        connected: isConnected,
    });

    // Production implementation
    // Check if the wallet is mapped to a user account in the game
    // A wallet can be connected to only one user account in a game
};

/**
 * Assigns a user's wallet to their game account.
 * @param {Request} req - The request object. Expects walletAddress in the URL and username, password in the body.
 * @param {Response} res - The response object. Returns success status.
 */
exports.assignWalletToUser = (req, res) => {
    const { walletAddress } = req.params;
    const { username, password } = req.body; // In practice, ensure password is handled securely

    // Here you would typically call the game API or update your database
    console.log(`Assigning wallet ${walletAddress} to user ${username}`);

    // Mock response assuming assignment is always successful
    res.json({
        success: true,
    });

    // Production implementation
    // Confirm the username/password combination
    // Confirm the wallet address is not already assigned to another user
    // Update the database with the wallet address assigned to the user
};

/**
 * Retrieves contract addresses related to a specific game level that have mappings to game assets.
 * @param {Request} req - The request object. Expects levelID in the URL.
 * @param {Response} res - The response object. Returns an array of contract objects.
 */
exports.getContracts = (req, res) => {
    const { levelID } = req.params;
    const levelNumber = parseInt(levelID);
    const contractsForLevel = gameContracts.find(
        (item) => item.level === levelNumber
    );

    if (contractsForLevel) {
        res.json(
            contractsForLevel.contracts.map((contract) => ({
                contract: contract.contract,
                chain: contract.chain,
            }))
        );
    } else {
        res.status(404).json({ message: "No contracts found for this level." });
    }

    // Production implementation
    // Retrieve contract addresses for the specified game level from the database
};

/**
 * Retrieves NFTs for a game level that are mapped to allowed game assets.
 * @param {Request} req - The request object, includes levelID in the URL, and expected NFT details in the body.
 * @param {Response} res - The response object, returns an array of allowed NFTs.
 */
exports.getNFTMap = (req, res) => {
    console.log("getNFTMap");
    const { levelID } = req.params;
    const nftDetails = req.body; // Array of { nftType, tokenId, contract, chain }
    const levelNumber = parseInt(levelID);
    const levelNFTMappings = gameNFTMappings.find(
        (mapping) => mapping.levelID === levelNumber
    );

    if (!levelNFTMappings) {
        return res.json([]);
    }
    console.log("levelNFTMappings", levelNFTMappings);
    // Filter NFTs that match the allowed mappings and the provided details
    const allowedNFTs = levelNFTMappings.nfts.filter((nft) =>
        nftDetails.some(
            (detail) =>
                detail.tokenId === nft.tokenId &&
                detail.contract === nft.contract &&
                detail.chain === nft.chain &&
                detail.nftType === nft.nftType
        )
    );

    res.json(allowedNFTs);

    // Production implementation
    // Use nftDetails to look up the mapping of game assets to NFTs in the database for the specified level
    // Return the mappings that are found in the database
};

/**
 * Retrieves the user's inventory for a specific game level.
 * @param {Request} req - The request object, includes levelID and walletAddress in the URL.
 * @param {Response} res - The response object, returning the user's inventory items.
 */
exports.getUserInventory = (req, res) => {
    console.log("getUserInventory");
    const { levelID, walletAddress } = req.params;
    const userInventory = userInventories.find(
        (inventory) =>
            inventory.walletAddress === walletAddress &&
            inventory.levelID === parseInt(levelID)
    );

    if (userInventory) {
        res.json(userInventory.items);
    } else {
        res.status(404).json({
            message: "No inventory found for this user and level.",
        });
    }

    // Production implementation
    // Retrieve the user's inventory for the specified level from the game database
    // Return the mapping of item IDs to item details, including NFT information if applicable
    // Items that have no mapping to NFTs could be returned with canExtract set to false or ignored
};

/**
 * Finalizes a portal transaction after confirmation on the blockchain.
 * @param {Request} req - The request object, includes levelID and walletAddress in the URL and transaction details in the body.
 * @param {Response} res - The response object, returns whether the transaction was completed.
 */
exports.finalizePortalTransaction = (req, res) => {
    const { levelID, walletAddress } = req.params;
    const { extract, inject } = req.body;

    // Find transaction
    const transaction = transactions.find(
        (tx) =>
            tx.walletAddress === walletAddress && tx.levelID === parseInt(levelID)
    );

    if (!transaction) {
        return res.status(404).json({ message: "Transaction not found." });
    }

    // Simulate inventory update
    const userInventory = inventories.find(
        (inv) =>
            inv.walletAddress === walletAddress &&
            inv.levelID === parseInt(levelID)
    );
    if (userInventory) {
        // Remove extracted items
        userInventory.items = userInventory.items.filter(
            (item) => !extract.includes(item.itemId)
        );

        // Simulate adding injected items (mock items need to be defined somewhere)
        inject.forEach((itemId) => {
            userInventory.items.push({ itemId, name: `New Item ${itemId}` });
        });
    }

    res.json({ finalized: true });

    // Production implementation
    // Use the inject array to add new items to the user's inventory
    // Use the extract array to remove items from the user's inventory AND mint them as NFTs
    // NFTs should be minted and sent to the user's wallet address
    // If an NFT is escrowed, rather than burned, it should be transferred to the user's wallet address
};
