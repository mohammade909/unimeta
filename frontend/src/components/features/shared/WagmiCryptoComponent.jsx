import React, { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  Wallet,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";

// USDT Contract ABI
const USDT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

// USDT Contract Addresses
const USDT_CONTRACTS = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum
  56: "0x55d398326f99059fF775485246999027B3197955", // BSC
  137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
};

const WagmiCryptoComponent = ({
  mode = "deposit",
  onTransactionComplete,
  toAddress = "",
  className = "",
  val = 0,
}) => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Component state
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Initialize amount based on mode and val prop
  useEffect(() => {
    if (mode === "withdrawal" && val > 0) {
      setAmount(val.toString());
    } else if (mode === "deposit") {
      setAmount(""); // Allow user input for deposits
    }
  }, [mode, val]);

  // Get USDT contract address for current chain
  const usdtAddress = USDT_CONTRACTS[chainId];

  // Read USDT balance
  const { data: balance } = useBalance({
    address: address,
    token: usdtAddress,
    enabled: isConnected && !!usdtAddress,
  });

  // Read USDT decimals
  const { data: decimals } = useReadContract({
    address: usdtAddress,
    abi: USDT_ABI,
    functionName: "decimals",
    enabled: !!usdtAddress,
  });

  // Write contract hook for transfer
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      setSuccess(
        `${mode === "deposit" ? "Deposit" : "Withdrawal"} successful!`
      );
      setAmount("");
      setError("");

      if (onTransactionComplete) {
        onTransactionComplete({
          hash,
          amount,
          toAddress,
          fromAddress: address, // Connected wallet is always the sender
          mode,
        });
      }

      // Close modal after successful withdrawal
      if (mode === "withdrawal") {
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    }
  }, [
    isConfirmed,
    hash,
    amount,
    toAddress,
    address,
    mode,
    onTransactionComplete,
  ]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed");
    }
    if (receiptError) {
      setError(receiptError.message || "Transaction confirmation failed");
    }
  }, [writeError, receiptError]);

  // Handle transaction
  const handleTransaction = async () => {
    if (!amount || !toAddress) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!usdtAddress) {
      setError("USDT not supported on this network");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const amountInWei = parseUnits(amount, decimals || 6);

      writeContract({
        address: usdtAddress,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [toAddress, amountInWei],
      });
    } catch (err) {
      setError(err.message || "Transaction failed");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Get explorer URL
  const getExplorerUrl = (hash) => {
    const explorers = {
      1: "https://etherscan.io/tx/",
      56: "https://bscscan.com/tx/",
      137: "https://polygonscan.com/tx/",
    };
    return explorers[chainId] ? `${explorers[chainId]}${hash}` : "#";
  };

  // Handle withdrawal button click
  const handleWithdrawalClick = () => {
    if (isConnected) {
      setShowModal(true);
    }
  };

  // Withdrawal Mode: Only show connect button
  if (mode === "withdrawal" && !showModal) {
    return (
      <div className={`${className}`}>
        {!isConnected ? (
          <div className="text-center">
            <div className="flex gap-4">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg hover:bg-yellow-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Connecting..." : `Connect ${connector.name}`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-between">
              <button
                onClick={() => disconnect()}
                className="text-sm text-gray-200 hover:text-gray-300"
              >
                Disconnect
              </button>
            </div>
            <button
              onClick={handleWithdrawalClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Pay
            </button>
          </div>
        )}
      </div>
    );
  };

  // Modal for withdrawal
  const WithdrawalModal = () => (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] rounded-xl shadow-lg w-full max-w-md p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-white space-x-3">
            <Send className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-green-300">
              Process Withdrawal
            </h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <TransactionForm />
      </div>
    </div>
  );

  // Transaction Form Component
  const TransactionForm = () => (
    <div className="space-y-4">
      {/* Connected Wallet Info */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Connected Wallet (From)</span>
          <button
            onClick={() => copyToClipboard(address)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm font-mono text-gray-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        {balance && (
          <p className="text-sm text-gray-300 mt-1">
            Balance:{" "}
            {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(
              4
            )}{" "}
            {balance.symbol}
          </p>
        )}
      </div>

      {/* Recipient Address Display */}
      {toAddress && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">
              Recipient Address (To)
            </span>
            <button
              onClick={() => copyToClipboard(toAddress)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm font-mono text-gray-300">
            {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
          </p>
        </div>
      )}

      {/* Network Warning */}
      {!usdtAddress && (
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-green-300">
              USDT not supported on this network. Please switch to Ethereum,
              BSC, or Polygon.
            </span>
          </div>
        </div>
      )}

      {/* Transaction Form */}
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (USDT)
          </label>
          <input
            type="number"
            disabled={mode === "withdrawal"} // Disable input for withdrawal mode
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-white/20 text-white bg-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {mode === "withdrawal" && (
            <p className="text-xs text-gray-400 mt-1">
              Amount is pre-set for withdrawal
            </p>
          )}
        </div>

        {/* Transaction Button */}
        <button
          onClick={handleTransaction}
          disabled={
            isWritePending || isConfirming || !amount || parseFloat(amount) <= 0
          }
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isWritePending || isConfirming || !amount || parseFloat(amount) <= 0
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isWritePending || isConfirming ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isWritePending ? "Confirming..." : "Processing..."}</span>
            </div>
          ) : (
            `Send ${amount} USDT`
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-900/50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-400 bg-green-900/50 p-3 rounded-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Transaction Hash */}
      {hash && (
        <div className="bg-blue-900/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-300">Transaction Hash:</span>
            <a
              href={getExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs font-mono text-blue-200 mt-1 break-all">
            {hash}
          </p>
        </div>
      )}
    </div>
  );

  // Deposit Mode: Show full form
  return (
    <>
      <div
        className={`bg-[#1e1e1e] rounded-xl shadow-lg w-full p-4 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-white space-x-3">
            <Download className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-green-300">
              Deposit Funds
            </h2>
          </div>
          {isConnected && (
            <button
              onClick={() => disconnect()}
              className="text-sm text-gray-200 hover:text-gray-300"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <div className="text-center max-w-md mx-auto py-8">
            <Wallet className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-200 mb-4">
              Connect your wallet to continue
            </p>
            <div className="flex gap-4">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={isPending}
                  className="w-full bg-yellow-700 text-white px-6 py-3 rounded-lg hover:bg-yellow-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Connecting..." : `Connect ${connector.name}`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <TransactionForm />
        )}
      </div>

      {/* Withdrawal Modal */}
      {mode === "withdrawal" && showModal && <WithdrawalModal />}
    </>
  );
};

export default WagmiCryptoComponent;