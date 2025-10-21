'use client';

import React, { useState } from 'react';
import { useHederaProvider } from '../hooks/useHederaProvider';
import { useMultisig } from '../hooks/useMultisig';
import type { HederaProviderConfig, MultisigConfig, TransactionProposal } from '../types/hedera';

interface MultisigDashboardProps {
  hederaConfig: HederaProviderConfig;
  multisigConfig: MultisigConfig;
}

export function MultisigDashboard({ hederaConfig, multisigConfig }: MultisigDashboardProps) {
  const { provider, isConnected: hederaConnected, connect: connectHedera, error: hederaError } = useHederaProvider(hederaConfig);
  const {
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
    error: multisigError,
    isLoading,
  } = useMultisig(provider, multisigConfig);

  const [newSignerAddress, setNewSignerAddress] = useState('');
  const [newSignerWeight, setNewSignerWeight] = useState(1);
  const [newThreshold, setNewThreshold] = useState(multisigConfig.threshold);
  const [proposalForm, setProposalForm] = useState({
    to: '',
    value: '',
    data: '',
  });

  const handleConnect = async () => {
    try {
      await connectHedera();
    } catch (error) {
      console.error('Failed to connect to Hedera:', error);
    }
  };

  const handleProposeTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const proposal: TransactionProposal = {
        id: '', // Will be set by the contract
        to: proposalForm.to,
        value: proposalForm.value,
        data: proposalForm.data,
        proposer: '', // Will be set by the contract
        approvals: [],
        status: 'pending',
        timestamp: Date.now(),
      };

      await proposeTransaction(proposal);
      setProposalForm({ to: '', value: '', data: '' });
    } catch (error) {
      console.error('Failed to propose transaction:', error);
    }
  };

  const handleAddSigner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSigner(newSignerAddress, newSignerWeight);
      setNewSignerAddress('');
      setNewSignerWeight(1);
    } catch (error) {
      console.error('Failed to add signer:', error);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      await updateThreshold(newThreshold);
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  };

  if (!hederaConnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Hedera Multisig Dashboard</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect to Hedera network to access multisig functionality</p>
            <button
              onClick={handleConnect}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect to Hedera
            </button>
            {hederaError && (
              <p className="text-red-600 mt-2">{hederaError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Initializing Multisig...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Hedera Multisig Dashboard</h2>

        {/* Multisig State */}
        {multisigState && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{multisigState.threshold}</div>
              <div className="text-sm text-gray-600">Threshold</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{multisigState.signerCount}</div>
              <div className="text-sm text-gray-600">Signers</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{multisigState.pendingTransactions}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{multisigState.executedTransactions}</div>
              <div className="text-sm text-gray-600">Executed</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(multisigError || hederaError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{multisigError || hederaError}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Propose Transaction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Propose Transaction</h3>
          <form onSubmit={handleProposeTransaction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Address</label>
              <input
                type="text"
                value={proposalForm.to}
                onChange={(e) => setProposalForm(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0.12345"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value (HBAR)</label>
              <input
                type="text"
                value={proposalForm.value}
                onChange={(e) => setProposalForm(prev => ({ ...prev, value: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data (hex)</label>
              <textarea
                value={proposalForm.data}
                onChange={(e) => setProposalForm(prev => ({ ...prev, data: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional contract call data"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Proposing...' : 'Propose Transaction'}
            </button>
          </form>
        </div>

        {/* Manage Signers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Manage Signers</h3>

          {/* Current Signers */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Current Signers</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {signers.map((signer, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm font-mono">{signer.address}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Weight: {signer.weight}</span>
                    {signer.active && <span className="text-green-600 text-sm">Active</span>}
                    <button
                      onClick={() => removeSigner(signer.address)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Signer */}
          <form onSubmit={handleAddSigner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Signer Address</label>
              <input
                type="text"
                value={newSignerAddress}
                onChange={(e) => setNewSignerAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.0.12345"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="number"
                value={newSignerWeight}
                onChange={(e) => setNewSignerWeight(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter signer weight (e.g., 1)"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Signer'}
            </button>
          </form>

          {/* Update Threshold */}
          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">Threshold</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new threshold (e.g., 2)"
                min="1"
                required
              />
              <button
                onClick={handleUpdateThreshold}
                disabled={isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Pending Transactions</h3>
        {pendingTransactions.length === 0 ? (
          <p className="text-gray-500">No pending transactions</p>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((tx) => (
              <div key={tx.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-sm">ID: {tx.id}</p>
                    <p className="font-mono text-sm">To: {tx.to}</p>
                    <p className="text-sm">Value: {tx.value} HBAR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      tx.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => approveTransaction(tx.id)}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => executeTransaction(tx.id)}
                    disabled={isLoading || tx.status !== 'approved'}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}