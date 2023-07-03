import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'solidity-docgen';
import dotenv from 'dotenv';
dotenv.config();

// Ensure that we have all the environment variables we need.
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error('Please set your MNEMONIC in a .env file');
} else {
  mnemonic = process.env.MNEMONIC;
}

let privateKey: string;
if (!process.env.PK) {
  throw new Error('Please set your PK in a .env file');
} else {
  privateKey = process.env.PK;
}

let alchemyApiKey: string;
if (!process.env.ALCHEMY_API_KEY) {
  throw new Error('Please set your ALCHEMY_API_KEY in a .env file');
} else {
  alchemyApiKey = process.env.ALCHEMY_API_KEY;
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      blockGasLimit: 20000000,
      throwOnCallFailures: false,
      chainId: 31337,
      gasPrice: 44000000,
      gas: 12000000,
      allowUnlimitedContractSize: true,
      initialBaseFeePerGas: 0,
      accounts: {
        mnemonic,
        accountsBalance: '1000000000000000000000',
      },
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
        enabled: false,
      },
    },

    // mainnet: {
    //   url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
    //   //url: 'http://localhost:8545',
    //   //gasPrice: 22000000000,
    //   chainId: 1,
    //   accounts: {
    //     mnemonic,
    //   },
    // },

    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [privateKey],
      chainId: 80001,
      // gas: 2100000,
      // gasPrice: 8000000000,
      gas: 'auto',
    },

    // polygon: {
    //   // url: 'https://matic-mumbai.chainstacklabs.com',
    //   url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    //   accounts: {
    //     count: 10,
    //     initialIndex: 0,
    //     mnemonic,
    //     path: "m/44'/60'/0'/0",
    //   },
    //   chainId: 137,
    //   // // gas: 'auto',
    //   // gas: 7000000,
    //   gasPrice: 1000000000000,
    // },

  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },

  solidity: {
    compilers: [
      {
        version: '0.8.19',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  gasReporter: {
    coinmarketcap: process.env.COIN_MARKET_CAP_KEY,
    currency: 'USD',
    gasPrice: 21,
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: ['mocks/', 'test/'],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_ID || process.env.MATIC_API_ID,
  },
  docgen: {
    // path: './docs',
    // clear: true,
    // runOnCompile: true,
    pages: "files"
  },
};

export default config;
