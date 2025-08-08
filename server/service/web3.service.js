const { Web3 } = require("web3");

// BSC Mainnet RPC (you can also use testnet: https://data-seed-prebsc-1-s1.binance.org:8545/)
const RPC_URL = "https://bsc-dataseed1.binance.org/";

// Environment variables
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GAS_LIMIT = process.env.GAS_LIMIT;
const GAS_PRICE = process.env.GAS_PRICE;

// BEP20 Token ABI (minimal required functions)
const TOKEN_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Initialize Web3
const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Create contract instance
const tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_CONTRACT_ADDRESS);

// Helper function to convert token amount to wei (considering decimals)
async function toTokenWei(amount) {
  const decimals = await tokenContract.methods.decimals().call();
  return web3.utils
    .toWei(amount.toString(), "ether")
    .toString()
    .replace("1".padEnd(19, "0"), "1".padEnd(parseInt(decimals) + 1, "0"));
}

// Helper function to validate Ethereum address
function isValidAddress(address) {
  return web3.utils.isAddress(address);
}

/**
 * Transfer tokens to another address
 * @param {string} toAddress - Recipient address
 * @param {number|string} qty - Amount to transfer
 * @returns {Promise<object>} Transfer result
 */
async function transferToken(toAddress, qty) {
  try {
    // Validation
    if (!toAddress || !qty) {
      return {
        success: false,
        message: "Missing required parameters: toAddress and qty",
      };
    }

    if (!isValidAddress(toAddress)) {
      return {
        success: false,
        message: "Invalid recipient address",
      };
    }

    if (qty <= 0) {
      return {
        success: false,
        message: "Quantity must be greater than 0",
      };
    }

    // Convert quantity to token wei
    const tokenAmount = await toTokenWei(qty);

    // Check sender balance
    const senderBalance = await tokenContract.methods
      .balanceOf(account.address)
      .call();
    if (BigInt(senderBalance) < BigInt(tokenAmount)) {
      return {
        success: false,
        message: "Insufficient token balance",
      };
    }

    // Get current gas price
    const gasPrice = GAS_PRICE || await web3.eth.getGasPrice();

    // Prepare transaction
    const tx = {
      from: account.address,
      to: TOKEN_CONTRACT_ADDRESS,
      data: tokenContract.methods.transfer(toAddress, tokenAmount).encodeABI(),
      gas: GAS_LIMIT || "100000",
      gasPrice: gasPrice,
    };

    // Sign and send transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    // Return successful response
    return {
      success: true,
      message: "Token transfer successful",
      data: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        from: account.address,
        to: toAddress,
        amount: qty,
        tokenContract: TOKEN_CONTRACT_ADDRESS,
      },
    };
  } catch (error) {
    console.error("Transfer error:", error);
    return {
      success: false,
      message: "Transfer failed",
      error: error.message,
    };
  }
}

/**
 * Get token balance of an address
 * @param {string} address - Address to check balance
 * @returns {Promise<object>} Balance result
 */
async function getBalanceOf(address) {
  try {
    if (!address) {
      return {
        success: false,
        message: "Missing required parameter: address",
      };
    }

    if (!isValidAddress(address)) {
      return {
        success: false,
        message: "Invalid address",
      };
    }

    const balance = await tokenContract.methods.balanceOf(address).call();
    const decimals = await tokenContract.methods.decimals().call();
    const readableBalance = web3.utils.fromWei(balance, "ether");

    return {
      success: true,
      data: {
        address: address,
        balance: balance,
        readableBalance: readableBalance,
        decimals: decimals,
      },
    };
  } catch (error) {
    console.error("Balance check error:", error);
    return {
      success: false,
      message: "Failed to get balance",
      error: error.message,
    };
  }
}

module.exports = {
  transferToken,
  getBalanceOf
};