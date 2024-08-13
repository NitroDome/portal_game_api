const fs = require("fs");
const csv = require("csv-parser");

async function getItemNames() {
    const csvFilePath = "../itemNames.csv";
    //const csvFilePath = "./src/utils/itemNames.csv";

    return new Promise((resolve, reject) => {
        const results = new Map();
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on("data", (data) => {
                results.set(data.id, data.value);
            })
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
}

/* Determining NFT Type
NFT Type: 100,650,705
NFT Type: 1 / 0065 / 07 / 06 = Slot / Item ID / Level / Max Level
*/
async function parseNftType(nftType) {
    const nftTypeStr = nftType.toString();
    if (nftTypeStr.length !== 9) {
        throw new Error("Invalid NFTType value. Expected a 9-digit number.");
    }

    const slot = parseInt(nftTypeStr.charAt(0));
    const itemId = parseInt(nftTypeStr.substring(1, 5));
    const level = parseInt(nftTypeStr.substring(5, 7));
    const maxLevel = parseInt(nftTypeStr.substring(7, 9));

    return {
        slot: slot,
        itemId: itemId,
        level: level,
        maxLevel: maxLevel,
    };
}

async function generateNftType(slot, itemId, level, maxLevel) {
    return slot * 100000000 + itemId * 10000 + level * 100 + maxLevel;
}

module.exports = {
    getItemNames,
    parseNftType,
    generateNftType,
};
