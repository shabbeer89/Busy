'use client';

import { useState } from 'react';
import { useNFTValidation } from '@/hooks/use-babt-validation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wallet, CheckCircle, XCircle, Settings, ExternalLink, RefreshCw, Info, Globe, TrendingUp, Users, Calendar } from 'lucide-react';
import { COMMON_SBT_ADDRESSES, formatAddressWithChecksum, needsChecksumCorrection, validateEthereumAddress } from '@/lib/babt-validation';

export function BABTValidator() {
  const {
    isLoading,
    hasTokens,
    balance,
    contractType,
    error,
    contractName,
    contractSymbol,
    tokenIds,
    customContractAddress,
    connectAndValidate,
    validate,
    validateContract,
    reset,
  } = useNFTValidation();

  const [manualAddress, setManualAddress] = useState('');
  const [localContractAddress, setLocalContractAddress] = useState<string>(COMMON_SBT_ADDRESSES.BABT_BSC);
  const [localTokenId, setLocalTokenId] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConnectAndValidate = async () => {
    try {
      await connectAndValidate(localContractAddress, localTokenId || undefined);
    } catch (err) {
      console.error('Failed to connect and validate:', err);
    }
  };

  const handleManualValidation = async () => {
    if (manualAddress.trim()) {
      try {
        await validate(manualAddress.trim(), localContractAddress, localTokenId || undefined);
      } catch (err) {
        console.error('Failed to validate address:', err);
      }
    }
  };

  const handleContractValidation = async () => {
    if (localContractAddress.trim()) {
      try {
        const result = await validateContract(localContractAddress.trim());
        if (result.isValid) {
          alert(`✅ Valid ${result.contractType} contract detected!\n\nYou can now use this address for token validation.`);
        } else {
          const errorMsg = result.error?.includes('does not contain contract code')
            ? `${result.error}\n\nThis might mean:\n• The contract isn't deployed yet\n• The address is just a wallet (EOA)\n• Wrong blockchain network`
            : `${result.error}\n\nPlease verify:\n• The contract is deployed\n• You're on the correct network\n• The address is a token contract`;
          alert(`❌ Contract validation failed:\n\n${errorMsg}`);
        }
      } catch (err) {
        console.error('Failed to validate contract:', err);
        alert('❌ Contract validation failed due to network error. Please try again.');
      }
    }
  };

  const handleFixChecksum = () => {
    try {
      // First validate the address
      const validation = validateEthereumAddress(localContractAddress);

      if (validation.isValid && validation.formatted) {
        setLocalContractAddress(validation.formatted);
        alert(`✅ Address checksum corrected!\n\nOriginal: ${localContractAddress}\nCorrected: ${validation.formatted}`);
      } else {
        alert(`❌ Address validation failed:\n\n${validation.error}\n\nPlease verify this is a valid Ethereum address.`);
      }
    } catch (error) {
      alert(`❌ Could not correct address checksum:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease verify the address is correct.`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            NFT/Token Validator
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          ⚠️ OLD SYSTEM: Validates Web3 tokens on-chain. For Binance App BABT, use "Binance BABT Verifier" instead.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="p-3 bg-muted rounded-lg space-y-3">
            <div className="text-sm font-medium">Contract Configuration</div>

            {/* Preset Contracts */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Quick Select</label>
              <select
                value={localContractAddress}
                onChange={(e) => setLocalContractAddress(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value={COMMON_SBT_ADDRESSES.BABT_BSC}>
                  BABT (Binance Account Bound Token)
                </option>
                <option value="">Enter Custom Contract</option>
              </select>
            </div>

            {/* Custom Contract Address */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Custom Contract Address</label>
                {needsChecksumCorrection(localContractAddress) && (
                  <Button
                    onClick={handleFixChecksum}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Fix Checksum
                  </Button>
                )}
              </div>
              <Input
                placeholder="0x..."
                value={localContractAddress}
                onChange={(e) => setLocalContractAddress(e.target.value)}
                className={needsChecksumCorrection(localContractAddress) ? 'border-yellow-500' : ''}
              />
              <Button
                onClick={handleContractValidation}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Validate Contract
              </Button>
            </div>

            {/* Token ID (for ERC-1155) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Token ID (ERC-1155)</label>
              <Input
                placeholder="Token ID (optional)"
                value={localTokenId}
                onChange={(e) => setLocalTokenId(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Validation Status */}
        {hasTokens && !isLoading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Badge variant="default" className="bg-green-500">
                Valid {contractType} Token
              </Badge>
            </div>

            <div className="text-sm space-y-1">
              <div>Balance: {balance} tokens</div>
              {contractName && <div>Contract: {contractName}</div>}
              {contractSymbol && <div>Symbol: {contractSymbol}</div>}
              {tokenIds && tokenIds.length > 0 && (
                <div>Token IDs: {tokenIds.join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* No Tokens Found */}
        {!hasTokens && !isLoading && (balance !== '0' || error) && (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <Badge variant="destructive">
              No Tokens Found
            </Badge>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleConnectAndValidate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect & Validate Tokens
              </>
            )}
          </Button>

          {/* Manual Address Input */}
          <div className="space-y-2">
            <Input
              placeholder="Or enter wallet address manually (0x...)"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <Button
              onClick={handleManualValidation}
              disabled={isLoading || !manualAddress.trim()}
              variant="outline"
              className="w-full"
            >
              Validate Address
            </Button>
          </div>
        </div>

        {/* Reset Button */}
        {(hasTokens || error) && (
          <Button
            onClick={reset}
            variant="ghost"
            className="w-full"
          >
            Reset
          </Button>
        )}

        {/* Network Requirements */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">⚠️ For Binance App BABT</div>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <div className="font-medium">❌ This validator is for Web3 tokens only</div>
            <div>✅ For Binance App BABT: Use "Binance BABT Verifier" component</div>
            <div>✅ Binance BABT requires OAuth authentication</div>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            This validator supports ERC-721 (NFTs), ERC-1155 (Multi-tokens), and ERC-20 (Fungible tokens).
          </p>
          <div className="space-y-1">
            <div className="font-medium">Verification Steps:</div>
            <div className="text-xs space-y-1">
              <div>1. Connect to BNB Smart Chain (Chain ID: 56)</div>
              <div>2. Enter the contract address you want to validate</div>
              <div>3. The system will check if it's a valid token contract</div>
              <div>4. Verify you own tokens from that contract</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span>Verify BABT on:</span>
            <a
              href={`https://bscscan.com/address/${COMMON_SBT_ADDRESSES.BABT_BSC}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              BSCScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}