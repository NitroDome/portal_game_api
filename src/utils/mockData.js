const gameContracts = [
    {
        level: 1,
        contracts: [
            {
                contract: "0x121313123113",
                chain: "BASE",
                description: "Primary assets for Level 1 adventurers",
            },
            {
                contract: "0x223423435334",
                chain: "BASE",
                description: "Utility tokens for Level 1 gameplay",
            },
        ],
    },
    {
        level: 2,
        contracts: [
            {
                contract: "0x334563456776",
                chain: "BASE",
                description: "Exclusive skins for Level 2 players",
            },
            {
                contract: "0x445674567457",
                chain: "BASE",
                description: "Power-ups for advanced levels",
            },
        ],
    },
];

const gameNFTMappings = [
    {
        levelID: 1,
        nfts: [
            {
                nftType: 85,
                tokenId: 10,
                chain: "BASE",
                gameLevel: 1,
                itemId: 101,
                name: "Celestial Sword",
                description: "A sword imbued with the essence of the cosmos.",
                quantity: 1,
                uri: "https://example.com/nfts/celestial-sword",
                image: "https://example.com/images/nfts/celestial-sword.png",
                type: "ERC721",
                contract: "0x121313123113",
            },
            {
                nftType: 1597,
                tokenId: 20,
                chain: "BASE",
                gameLevel: 1,
                itemId: 102,
                name: "Galactic Shield",
                description: "A shield crafted from star fragments.",
                quantity: 2,
                uri: "https://example.com/nfts/galactic-shield",
                image: "https://example.com/images/nfts/galactic-shield.png",
                type: "ERC721",
                contract: "0x223423435334",
            },
        ],
    },
];

const userInventories = [
    {
        walletAddress: "0xABC123DEF",
        levelID: 1,
        items: [
            {
                gameLevel: 1,
                itemId: 201,
                name: "Mystic Wand",
                description: "A wand imbued with ancient magic.",
                nftType: 721,
                quantity: 1,
                quantityPerNft: 1,
                uri: "https://example.com/inventory/mystic-wand",
                image: "https://example.com/images/items/mystic-wand.png",
                chain: "Ethereum",
                type: "ERC721",
                address: "0x987654321DEF",
                canExtract: true,
            },
            {
                gameLevel: 1,
                itemId: 202,
                name: "Shadow Cloak",
                description:
                    "Grants invisibility to the wearer under moonlight.",
                nftType: 721,
                quantity: 1,
                quantityPerNft: 1,
                uri: "https://example.com/inventory/shadow-cloak",
                image: "https://example.com/images/items/shadow-cloak.png",
                chain: "Ethereum",
                type: "ERC721",
                address: "0x123456789ABC",
                canExtract: false,
            },
        ],
    },
];

const transactions = [
    {
        txID: 123,
        level: 1,
        walletAddress: "0xABC123DEF",
        extract: [201, 202], // itemIds to be removed and minted as NFTs
        inject: [203, 204], // itemIds to be added from NFTs or other sources
    },
];

const inventories = [
    {
        walletAddress: "0xABC123DEF",
        levelID: 1,
        items: [
            {
                itemId: 201,
                name: "Mystic Wand",
                // other item details...
            },
            {
                itemId: 202,
                name: "Shadow Cloak",
                // other item details...
            },
        ],
    },
];

module.exports = {
    transactions,
    inventories,
    userInventories,
    gameContracts,
    gameNFTMappings,
};
