require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const { API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
   hardhat: {},
    rinkeby: {
       url: API_URL,
       accounts: [`0x${PRIVATE_KEY}`]
    }
 }
};
