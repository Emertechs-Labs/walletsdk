import { useState, useEffect } from 'react';
import { useAccount, useBlockNumber, usePublicClient } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

export interface BaseTransaction {
  hash: `0x${string}`;
  blockNumber: bigint;
  timestamp: number;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  gasUsed: bigint;
  gasPrice: bigint;
  status: 'success' | 'failed';
  type: 'transfer' | 'contract';
}

export function useTransactionHistory(limit = 10) {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const [transactions, setTransactions] = useState<BaseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBaseNetwork = chainId === base.id || chainId === baseSepolia.id;

  const fetchTransactionHistory = async () => {
    if (!address || !isBaseNetwork || !publicClient) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get latest transactions from the address
      // Note: This is a simplified implementation
      // In production, you'd use a service like Etherscan API or The Graph

      const latestBlock = blockNumber || 0n;
      const fromBlock = latestBlock - 10000n; // Last 10000 blocks

      const logs = await publicClient.getLogs({
        address,
        fromBlock,
        toBlock: latestBlock,
      });

      // Convert logs to transactions
      // This is approximate - you'd need to fetch full tx data
      const txPromises = logs.slice(0, limit).map(async (log) => {
        try {
          const tx = await publicClient.getTransaction({ hash: log.transactionHash! });
          const receipt = await publicClient.getTransactionReceipt({ hash: log.transactionHash! });
          const block = await publicClient.getBlock({ blockNumber: tx.blockNumber! });

          return {
            hash: tx.hash,
            blockNumber: tx.blockNumber!,
            timestamp: Number(block.timestamp),
            from: tx.from,
            to: tx.to || '0x0000000000000000000000000000000000000000',
            value: tx.value,
            gasUsed: receipt.gasUsed,
            gasPrice: tx.gasPrice || 0n,
            status: receipt.status === 'success' ? 'success' : 'failed',
            type: tx.to ? 'transfer' : 'contract',
          } as BaseTransaction;
        } catch {
          return null;
        }
      });

      const txs = (await Promise.all(txPromises)).filter(Boolean) as BaseTransaction[];
      setTransactions(txs);
    } catch (err) {
      setError('Failed to fetch transaction history');
      console.error('Transaction history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [address, chainId, blockNumber]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactionHistory,
    isBaseNetwork,
  };
}