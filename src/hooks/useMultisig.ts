import { useState, useEffect, useCallback } from 'react';
import { MultisigManager } from '../lib/multisig-manager';
import { HederaProvider } from '../lib/hedera-provider';
import type {
  MultisigConfig,
  TransactionProposal,
  MultisigTransaction,
  UseMultisigReturn,
  SignerInfo,
  MultisigState
} from '../types/hedera';

export function useMultisig(
  provider: HederaProvider | null,
  config: MultisigConfig
): UseMultisigReturn {
  const [manager, setManager] = useState<MultisigManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [multisigState, setMultisigState] = useState<MultisigState | null>(null);
  const [signers, setSigners] = useState<SignerInfo[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<MultisigTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize multisig manager
  useEffect(() => {
    if (!provider || !config.contractId) {
      setManager(null);
      setIsInitialized(false);
      return;
    }

    try {
      const newManager = new MultisigManager(provider, config);
      setManager(newManager);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize multisig manager');
      setIsInitialized(false);
    }
  }, [provider, config.contractId, config.threshold]);

  // Load multisig state
  const loadMultisigState = useCallback(async () => {
    if (!manager) return;

    setIsLoading(true);
    try {
      const state = await manager.getMultisigState();
      setMultisigState(state);

      const signerList = await manager.getSigners();
      setSigners(signerList);

      const pending = await manager.getPendingTransactions();
      setPendingTransactions(pending);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load multisig state');
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  // Propose a transaction
  const proposeTransaction = useCallback(async (proposal: TransactionProposal) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      const txId = await manager.proposeTransaction(proposal.to, proposal.value, proposal.data);
      await loadMultisigState(); // Refresh state
      setError(null);
      return txId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to propose transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Approve a transaction
  const approveTransaction = useCallback(async (transactionId: string) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      await manager.approveTransaction(transactionId);
      await loadMultisigState(); // Refresh state
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Execute a transaction
  const executeTransaction = useCallback(async (transactionId: string) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      await manager.executeTransaction(transactionId);
      await loadMultisigState(); // Refresh state
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Add a signer
  const addSigner = useCallback(async (signerAddress: string, weight: number) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      await manager.addSigner(signerAddress, weight);
      await loadMultisigState(); // Refresh state
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add signer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Remove a signer
  const removeSigner = useCallback(async (signerAddress: string) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      await manager.removeSigner(signerAddress);
      await loadMultisigState(); // Refresh state
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove signer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Update threshold
  const updateThreshold = useCallback(async (newThreshold: number) => {
    if (!manager) {
      throw new Error('Multisig manager not initialized');
    }

    setIsLoading(true);
    try {
      await manager.updateThreshold(newThreshold);
      await loadMultisigState(); // Refresh state
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update threshold';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [manager, loadMultisigState]);

  // Load state when manager is initialized
  useEffect(() => {
    if (isInitialized) {
      loadMultisigState();
    }
  }, [isInitialized, loadMultisigState]);

  return {
    isInitialized,
    multisigState,
    signers,
    pendingTransactions,
    proposeTransaction,
    approveTransaction,
    executeTransaction,
    addSigner,
    removeSigner,
    updateThreshold,
    loadMultisigState,
    error,
    isLoading,
  };
}