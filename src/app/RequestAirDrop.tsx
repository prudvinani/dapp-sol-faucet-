"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function RequestAirdrop() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [input, setInput] = useState<string>("");
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);

    // Function to check wallet balance
    async function checkBalance() {
        if (!wallet.publicKey) {
            setBalance(null);
            return;
        }

        setIsLoadingBalance(true);
        try {
            const balanceInLamports = await connection.getBalance(wallet.publicKey);
            const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
            setBalance(balanceInSOL);
        } catch (error) {
            toast.error("Failed to fetch balance");
            console.error("Balance fetch error:", error);
            setBalance(null);
        } finally {
            setIsLoadingBalance(false);
        }
    }

    // Check balance when wallet connects/disconnects or after transactions
    useEffect(() => {
        checkBalance();
        
        // Set up interval to auto-refresh balance every 10 seconds
        const interval = setInterval(() => {
            if (wallet.publicKey) {
                checkBalance();
            }
        }, 10000);
        
        return () => clearInterval(interval);
    }, [wallet.publicKey, connection]);

    async function requestAirdrop() {
        if (!wallet.publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        // Check if amount exceeds typical airdrop limits
        if (amount > 5) {
            toast.error("Airdrop amount too high. Try 1-2 SOL maximum.");
            return;
        }

        try {

            const initialBalance = await connection.getBalance(wallet.publicKey);
            const signature = await connection.requestAirdrop(
                wallet.publicKey, 
                amount * LAMPORTS_PER_SOL
            );
            
            toast.success(`Airdrop requested! Signature: ${signature.slice(0, 8)}...`);
            
            try {
                const finalBalance = await connection.getBalance(wallet.publicKey);
                const balanceIncrease = (finalBalance - initialBalance) / LAMPORTS_PER_SOL;
                
                if (balanceIncrease > 0) {
                    toast.success(`Successfully received ${balanceIncrease} SOL!`);
                } else {
                    toast.warning("Transaction confirmed but balance didn't increase. You may have hit airdrop limits.");
                }
                
                // Refresh balance display
                checkBalance();
                
                // Clear the input after successful airdrop
                setInput("");
            } catch (confirmError) {
                toast.error("Transaction may have failed or timed out. Check your balance.");
                checkBalance();
            }
            
        } catch (error: any) {
            console.error("Airdrop error:", error);
            
            // Handle specific error types
            if (error.message?.includes('airdrop request limit exceeded')) {
                toast.error("Airdrop limit exceeded. Wait 24 hours or try a smaller amount.");
            } else if (error.message?.includes('blockhash not found')) {
                toast.error("Network congestion. Please try again.");
            } else if (error.message?.includes('Invalid request')) {
                toast.error("Make sure you're connected to Devnet, not Mainnet.");
            } else {
                toast.error(`Airdrop failed: ${error.message || 'Unknown error'}`);
            }
        }
    }

    return (
        <div className="space-y-4 px-[1px]">
            {/* Network Warning */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg ">
                <p className="text-sm text-yellow-800">
                    ⚠️ Airdrops only work on <strong>Devnet/Testnet</strong>. 
                    Make sure your wallet is connected to the correct network.
                </p>
            </div>

            {/* Balance Display */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Wallet Balance:</span>
                    <div className="flex items-center gap-2">
                        {isLoadingBalance ? (
                            <span className="text-gray-500">Loading...</span>
                        ) : balance !== null ? (
                            <span className="font-bold text-green-600">
                                {balance.toFixed(4)} SOL
                            </span>
                        ) : (
                            <span className="text-gray-500">
                                {wallet.publicKey ? "Unable to fetch" : "Connect wallet"}
                            </span>
                        )}
                        <Button 
                            onClick={checkBalance} 
                            variant="outline" 
                            size="sm"
                            disabled={!wallet.publicKey || isLoadingBalance}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
                {wallet.publicKey && (
                    <div className="text-xs text-gray-500 mt-1">
                        Address: {wallet.publicKey.toBase58().slice(0, 8)}...{wallet.publicKey.toBase58().slice(-8)}
                    </div>
                )}
            </div>

            {/* Airdrop Form */}
            <div className="space-y-2">
                <Input 
                    type="text" 
                    placeholder="Amount (SOL)" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                />
                <Button 
                    onClick={requestAirdrop} 
                    className="w-full"
                    disabled={!wallet.publicKey}
                >
                    Request Airdrop
                </Button>
            </div>
        </div>
    );
}