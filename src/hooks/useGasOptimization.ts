import { useEstimateGas, useFeeData, useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: string;
}

export interface BatchTransaction {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
}

export function useGasOptimization() {
  const chainId = useChainId();
  const isBaseNetwork = chainId === base.id || chainId === baseSepolia.id;

  const { data: feeData } = useFeeData({
    chainId,
  });

  // Estimate gas for a single transaction
  const estimateGas = (tx: {
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
    from?: `0x${string}`;
  }) => {
    const { data: estimatedGas } = useEstimateGas({
      to: tx.to,
      value: tx.value,
      data: tx.data,
      account: tx.from,
    });

    return estimatedGas;
  };

  // Get optimized gas price
  const getOptimizedGasPrice = (): GasEstimate | null => {
    if (!feeData) return null;

    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 0n;
    const priorityFee = feeData.maxPriorityFeePerGas || 1000000n; // 1 gwei

    // For Base, optimize for L2
    const optimizedGasPrice = isBaseNetwork ? gasPrice * 80n / 100n : gasPrice; // 20% reduction for Base

    return {
      gasLimit: 21000n, // Default
      gasPrice: optimizedGasPrice,
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas * 80n / 100n : undefined,
      maxPriorityFeePerGas: priorityFee,
      estimatedCost: '0', // Will be calculated per tx
    };
  };

  // Estimate cost for transaction
  const estimateCost = (gasLimit: bigint, gasPrice: bigint): string => {
    const cost = gasLimit * gasPrice;
    return parseEther(cost.toString()).toString(); // Convert to ether
  };

  // Batch transactions (using multicall if available)
  const batchTransactions = async (transactions: BatchTransaction[]) => {
    // For Base smart wallets, batching is supported
    // For regular wallets, could use multicall contract
    // Placeholder implementation
    return transactions;
  };

  // Check if paymaster is available (for smart wallets)
  const isPaymasterAvailable = () => {
    // Check if using smart wallet
    return false; // Placeholder
  };

  return {
    estimateGas,
    getOptimizedGasPrice,
    estimateCost,
    batchTransactions,
    isPaymasterAvailable,
    isBaseNetwork,
  };
}