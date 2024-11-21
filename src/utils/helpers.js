const fs = require("fs");
const csv = require("csv-parser");

async function parseNftType(nftType) {
    /*

    When using a deterministic NFT type, the parameter nftType is parse
    to determine the characteristic of the NFT, allowing simple mapping
    of NFT type to game asset characteristics.

    */
}

async function generateNftType(slot, itemId, level, maxLevel) {
    /*

    When generating a deterministic NFT type, the parameters slot, itemId,
    level, and maxLevel are combined to create a unique NFT type.

    These parameters are simply examples of values that can be used to
    generate a deterministic NFT type. The actual values used will depend
    on the specific requirements of the game and the characteristics of the NFTs.

    */
}

module.exports = {
    parseNftType,
    generateNftType,
};
