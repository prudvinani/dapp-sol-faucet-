
  "use client"
  import React from 'react';
  import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
  import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
  import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
  import {
      WalletModalProvider,
      WalletDisconnectButton,
      WalletMultiButton
  } from '@solana/wallet-adapter-react-ui';
  import '@solana/wallet-adapter-react-ui/styles.css';
  import {RequestAirdrop} from "./RequestAirDrop"
  export default function Home() {
    return (
      <div className="font-sans flex flex-col justify-center items-center space-y-10 mt-30">
              <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/SjahEKsEsdxAzD0sCBl_V3wVu_H9QJtD"}>
              <WalletProvider wallets={[]} autoConnect>
                  <WalletModalProvider >
                      <WalletMultiButton className='bg-white text-black font-sans' />
                      <WalletDisconnectButton className='bg-white text-black font-sans'/>
                      <RequestAirdrop/>
                  </WalletModalProvider>
              </WalletProvider>
          </ConnectionProvider>
      </div>
    );
  }
