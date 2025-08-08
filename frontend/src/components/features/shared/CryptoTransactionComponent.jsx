import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  useWeb3Modal,
  useWeb3ModalProvider,
  useWeb3ModalAccount,
  useWeb3ModalState,
  useDisconnect,
} from '@web3modal/ethers/react';
import { 
  Wallet, 
  Send, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

// USDT Contract ABI (minimal for transfer)
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// USDT Contract Addresses
const USDT_CONTRACTS = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum Mainnet
  56: "0x55d398326f99059fF775485246999027B3197955", // BSC Mainnet
  137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
  // Add more networks as needed
};

const CryptoTransactionComponent = ({ 
  mode = 'deposit', // 'deposit' or 'withdrawal'
  onTransactionComplete,
  adminUsdtAddress = '',
  userUsdtAddress = '',
  className = ''
}) => {
  const { open } = useWeb3Modal();
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { selectedNetworkId } = useWeb3ModalState();
  const { disconnect } = useDisconnect();

  // Component state
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize addresses based on mode
  useEffect(() => {
    if (mode === 'deposit') {
      setToAddress(adminUsdtAddress);
      setFromAddress(address || '');
    } else {
      setToAddress(userUsdtAddress);
      setFromAddress(adminUsdtAddress);
    }
  }, [mode, adminUsdtAddress, userUsdtAddress, address]);

  // Fetch USDT balance
  const fetchBalance = useCallback(async () => {
    if (!walletProvider || !address || !chainId) return;

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const usdtAddress = USDT_CONTRACTS[chainId];
      
      if (!usdtAddress) {
        setError('USDT not supported on this network');
        return;
      }

      const contract = new ethers.Contract(usdtAddress, USDT_ABI, provider);
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      setBalance(ethers.formatUnits(balance, decimals));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  }, [walletProvider, address, chainId]);

  // Fetch balance when wallet connects
  useEffect(() => {
    if (isConnected && mode === 'deposit') {
      fetchBalance();
    }
  }, [isConnected, fetchBalance, mode]);

  // Handle transaction
  const handleTransaction = async () => {
    if (!amount || !toAddress || !fromAddress) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const usdtAddress = USDT_CONTRACTS[chainId];

      if (!usdtAddress) {
        throw new Error('USDT not supported on this network');
      }

      const contract = new ethers.Contract(usdtAddress, USDT_ABI, signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);

      // Execute transaction
      const tx = await contract.transfer(toAddress, amountInWei);
      setTransactionHash(tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSuccess(`${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
        setAmount('');
        
        // Refresh balance
        if (mode === 'deposit') {
          fetchBalance();
        }
        
        // Callback for parent component
        if (onTransactionComplete) {
          onTransactionComplete({
            hash: tx.hash,
            amount,
            toAddress,
            fromAddress,
            mode
          });
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Get explorer URL
  const getExplorerUrl = (hash) => {
    const explorers = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      137: 'https://polygonscan.com/tx/',
    };
    return explorers[chainId] ? `${explorers[chainId]}${hash}` : '#';
  };

  return (
    <div className={`max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {mode === 'deposit' ? (
            <Download className="h-6 w-6 text-green-600" />
          ) : (
            <Send className="h-6 w-6 text-blue-600" />
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'deposit' ? 'Deposit Funds' : 'Process Withdrawal'}
          </h2>
        </div>
        {isConnected && (
          <button
            onClick={disconnect}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <div className="text-center py-8">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Connect your wallet to continue</p>
          <button
            onClick={() => open()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Wallet Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Connected Wallet</span>
              <button
                onClick={() => copyToClipboard(address)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-mono text-gray-900">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            {mode === 'deposit' && (
              <p className="text-sm text-gray-600 mt-1">
                Balance: {parseFloat(balance).toFixed(4)} USDT
              </p>
            )}
          </div>

          {/* Transaction Form */}
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USDT)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* From Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Address
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0x..."
                  readOnly={mode === 'deposit'}
                />
                <button
                  onClick={() => copyToClipboard(fromAddress)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* To Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Address
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0x..."
                  readOnly={mode === 'deposit'}
                />
                <button
                  onClick={() => copyToClipboard(toAddress)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Transaction Button */}
            <button
              onClick={handleTransaction}
              disabled={isLoading || !amount || !toAddress}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading || !amount || !toAddress
                  ? 'bg-gray-300 cursor-not-allowed'
                  : mode === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `${mode === 'deposit' ? 'Deposit' : 'Send'} ${amount || '0'} USDT`
              )}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Transaction Hash:</span>
                <a
                  href={getExplorerUrl(transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-xs font-mono text-blue-900 mt-1 break-all">
                {transactionHash}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CryptoTransactionComponent;