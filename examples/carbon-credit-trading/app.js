// Contract configuration
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // New Real Contract on Local Hardhat Network

// Note: This is a placeholder address.
// To use this application:
// 1. Deploy the CarbonCreditTrading.sol contract to your chosen network
// 2. Replace CONTRACT_ADDRESS with your deployed contract address
// 3. Ensure your MetaMask is connected to the same network

console.log('Contract Address:', CONTRACT_ADDRESS);
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "BalanceUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "projectType",
                "type": "string"
            }
        ],
        "name": "CreditIssued",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            }
        ],
        "name": "IssuerAuthorized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            }
        ],
        "name": "OrderCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "seller",
                "type": "address"
            }
        ],
        "name": "TradeExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "verificationHash",
                "type": "bytes32"
            }
        ],
        "name": "VerificationCompleted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            }
        ],
        "name": "authorizeIssuer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "authorizedIssuers",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "cancelOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "carbonCredits",
        "outputs": [
            {
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            },
            {
                "internalType": "euint32",
                "name": "encryptedAmount",
                "type": "uint256"
            },
            {
                "internalType": "euint32",
                "name": "encryptedPrice",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "projectType",
                "type": "string"
            },
            {
                "internalType": "bytes32",
                "name": "verificationHash",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            },
            {
                "internalType": "uint32",
                "name": "amount",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "maxPricePerCredit",
                "type": "uint32"
            }
        ],
        "name": "createBuyOrder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint64",
                "name": "amount",
                "type": "uint64"
            }
        ],
        "name": "depositTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "executeTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            }
        ],
        "name": "getCreditInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "projectType",
                "type": "string"
            },
            {
                "internalType": "bytes32",
                "name": "verificationHash",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyBalances",
        "outputs": [
            {
                "internalType": "euint64",
                "name": "encryptedCreditBalance",
                "type": "uint256"
            },
            {
                "internalType": "euint64",
                "name": "encryptedTokenBalance",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyCreditIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyOrderIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "orderId",
                "type": "uint256"
            }
        ],
        "name": "getOrderInfo",
        "outputs": [
            {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "isFulfilled",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getSystemStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalCredits",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalOrders",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            }
        ],
        "name": "isAuthorizedIssuer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint32",
                "name": "amount",
                "type": "uint32"
            },
            {
                "internalType": "uint32",
                "name": "pricePerCredit",
                "type": "uint32"
            },
            {
                "internalType": "string",
                "name": "projectType",
                "type": "string"
            },
            {
                "internalType": "bytes32",
                "name": "verificationHash",
                "type": "bytes32"
            }
        ],
        "name": "issueCarbonCredits",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "isUserRegistered",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextCreditId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextOrderId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "orders",
        "outputs": [
            {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            },
            {
                "internalType": "euint32",
                "name": "encryptedAmount",
                "type": "uint256"
            },
            {
                "internalType": "euint32",
                "name": "encryptedMaxPrice",
                "type": "uint256"
            },
            {
                "internalType": "euint64",
                "name": "encryptedTotalValue",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "isFulfilled",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "registerUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "creditId",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "newVerificationHash",
                "type": "bytes32"
            }
        ],
        "name": "updateVerification",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userBalances",
        "outputs": [
            {
                "internalType": "euint64",
                "name": "encryptedCreditBalance",
                "type": "uint256"
            },
            {
                "internalType": "euint64",
                "name": "encryptedTokenBalance",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isRegistered",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userCreditIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userOrderIds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let provider, signer, contract, userAddress;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Application initializing...');

    // Check if ethers is loaded
    if (typeof ethers === 'undefined') {
        console.error('Ethers.js not loaded');
        showStatus('connectionStatus', 'Loading ethers.js library...', 'loading');
        // Wait a bit and try again
        setTimeout(() => {
            if (typeof ethers === 'undefined') {
                showStatus('connectionStatus', 'Failed to load ethers.js. Please refresh the page.', 'error');
            } else {
                showStatus('connectionStatus', 'Ready to connect wallet', 'success');
            }
        }, 3000);
    } else {
        console.log('Ethers.js loaded successfully');
        showStatus('connectionStatus', 'Ready to connect wallet', 'success');
    }

    setupEventListeners();

    // Try to load system stats
    try {
        await loadSystemStats();
    } catch (error) {
        console.log('System stats will be loaded after wallet connection');
    }

    // Check if user was previously connected
    await checkPreviousConnection();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('registerUser').addEventListener('click', registerUser);
    document.getElementById('issueForm').addEventListener('submit', issueCredits);
    document.getElementById('buyOrderForm').addEventListener('submit', createBuyOrder);
    document.getElementById('depositForm').addEventListener('submit', depositTokens);
    document.getElementById('refreshBalances').addEventListener('click', refreshBalances);
}

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load tab-specific data
    switch(tabName) {
        case 'trade':
            loadAvailableCredits();
            break;
        case 'orders':
            loadUserOrders();
            loadPendingOrders();
            break;
        case 'balances':
            refreshBalances();
            break;
    }
}

// Connect wallet
async function connectWallet() {
    try {
        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            showStatus('connectionStatus', 'Ethers.js library not loaded. Please refresh the page.', 'error');
            return;
        }

        // Check for MetaMask
        if (typeof window.ethereum === 'undefined') {
            showStatus('connectionStatus', 'Please install MetaMask to use this application', 'error');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        // Check if MetaMask is locked
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        }

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Update UI
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('walletAddress').textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;

        const network = await provider.getNetwork();
        document.getElementById('networkInfo').textContent = `Network: ${network.name}`;

        showStatus('connectionStatus', `Connected to ${userAddress}`, 'success');

        // Check if user is registered
        await checkUserRegistration();

    } catch (error) {
        console.error('Error connecting wallet:', error);

        // Handle specific error cases
        if (error.code === 4001) {
            showStatus('connectionStatus', 'User rejected wallet connection', 'error');
        } else if (error.code === -32002) {
            showStatus('connectionStatus', 'Wallet connection request pending. Please check MetaMask.', 'loading');
        } else {
            showStatus('connectionStatus', `Failed to connect wallet: ${error.message}`, 'error');
        }
    }
}

// Check if user was previously connected
async function checkPreviousConnection() {
    try {
        if (typeof window.ethereum !== 'undefined' && typeof ethers !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                console.log('Previous connection found, attempting to reconnect...');
                await connectWallet();
            }
        }
    } catch (error) {
        console.log('No previous connection found');
    }
}

// Check user registration status
async function checkUserRegistration() {
    try {
        const isRegistered = await contract.isUserRegistered(userAddress);
        if (isRegistered) {
            showStatus('registerStatus', 'User is already registered', 'success');
            await refreshBalances();
        } else {
            showStatus('registerStatus', 'User not registered. Please register to continue.', 'error');
        }
    } catch (error) {
        console.error('Error checking registration:', error);
        showStatus('registerStatus', 'Error checking registration status', 'error');
    }
}

// Register user
async function registerUser() {
    try {
        if (!contract) {
            showStatus('registerStatus', 'Please connect your wallet first', 'error');
            return;
        }

        showStatus('registerStatus', 'Registering user...', 'loading');

        const tx = await contract.registerUser();
        await tx.wait();

        showStatus('registerStatus', 'User registered successfully!', 'success');
        await refreshBalances();

    } catch (error) {
        console.error('Error registering user:', error);
        showStatus('registerStatus', `Registration failed: ${error.message}`, 'error');
    }
}

// Issue carbon credits
async function issueCredits(event) {
    event.preventDefault();

    try {
        if (!contract) {
            showStatus('issueStatus', 'Please connect your wallet first', 'error');
            return;
        }

        const amount = parseInt(document.getElementById('creditAmount').value);
        const price = parseInt(document.getElementById('creditPrice').value);
        const projectType = document.getElementById('projectType').value;
        const verificationHash = document.getElementById('verificationHash').value;

        if (!verificationHash.startsWith('0x')) {
            showStatus('issueStatus', 'Verification hash must start with 0x', 'error');
            return;
        }

        showStatus('issueStatus', 'Issuing carbon credits...', 'loading');

        const tx = await contract.issueCarbonCredits(amount, price, projectType, verificationHash);
        await tx.wait();

        showStatus('issueStatus', 'Carbon credits issued successfully!', 'success');
        document.getElementById('issueForm').reset();

    } catch (error) {
        console.error('Error issuing credits:', error);
        showStatus('issueStatus', `Failed to issue credits: ${error.message}`, 'error');
    }
}

// Create buy order
async function createBuyOrder(event) {
    event.preventDefault();

    try {
        if (!contract) {
            showStatus('orderStatus', 'Please connect your wallet first', 'error');
            return;
        }

        const creditId = parseInt(document.getElementById('creditId').value);
        const amount = parseInt(document.getElementById('orderAmount').value);
        const maxPrice = parseInt(document.getElementById('maxPrice').value);

        showStatus('orderStatus', 'Creating buy order...', 'loading');

        const tx = await contract.createBuyOrder(creditId, amount, maxPrice);
        await tx.wait();

        showStatus('orderStatus', 'Buy order created successfully!', 'success');
        document.getElementById('buyOrderForm').reset();

    } catch (error) {
        console.error('Error creating order:', error);
        showStatus('orderStatus', `Failed to create order: ${error.message}`, 'error');
    }
}

// Deposit tokens
async function depositTokens(event) {
    event.preventDefault();

    try {
        if (!contract) {
            showStatus('depositStatus', 'Please connect your wallet first', 'error');
            return;
        }

        const amount = parseInt(document.getElementById('depositAmount').value);

        showStatus('depositStatus', 'Depositing tokens...', 'loading');

        const tx = await contract.depositTokens(amount);
        await tx.wait();

        showStatus('depositStatus', 'Tokens deposited successfully!', 'success');
        document.getElementById('depositForm').reset();
        await refreshBalances();

    } catch (error) {
        console.error('Error depositing tokens:', error);
        showStatus('depositStatus', `Failed to deposit tokens: ${error.message}`, 'error');
    }
}

// Load available credits
async function loadAvailableCredits() {
    try {
        if (!contract) return;

        const creditsList = document.getElementById('creditsList');
        creditsList.innerHTML = '<p class="loading">Loading available credits...</p>';

        const stats = await contract.getSystemStats();
        const totalCredits = stats.totalCredits.toNumber();

        if (totalCredits === 0) {
            creditsList.innerHTML = '<p>No credits available yet.</p>';
            return;
        }

        let creditsHtml = '';

        for (let i = 1; i <= totalCredits; i++) {
            try {
                const creditInfo = await contract.getCreditInfo(i);

                if (creditInfo.isActive) {
                    creditsHtml += `
                        <div class="credit-item">
                            <h4>Credit ID: ${i}</h4>
                            <p><strong>Issuer:</strong> ${creditInfo.issuer}</p>
                            <p><strong>Project Type:</strong> ${creditInfo.projectType}</p>
                            <p><strong>Issued:</strong> ${new Date(creditInfo.timestamp * 1000).toLocaleDateString()}</p>
                            <p><strong>Verification Hash:</strong> ${creditInfo.verificationHash}</p>
                            <div class="credit-actions">
                                <button class="btn btn-primary" onclick="document.getElementById('creditId').value=${i}; showTab('trade')">Create Order</button>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error(`Error loading credit ${i}:`, error);
            }
        }

        creditsList.innerHTML = creditsHtml || '<p>No active credits available.</p>';

    } catch (error) {
        console.error('Error loading credits:', error);
        document.getElementById('creditsList').innerHTML = '<p>Error loading credits.</p>';
    }
}

// Load user orders
async function loadUserOrders() {
    try {
        if (!contract || !userAddress) return;

        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '<p class="loading">Loading your orders...</p>';

        const orderIds = await contract.getMyOrderIds();

        if (orderIds.length === 0) {
            ordersList.innerHTML = '<p>You have no orders yet.</p>';
            return;
        }

        let ordersHtml = '';

        for (const orderId of orderIds) {
            try {
                const orderInfo = await contract.getOrderInfo(orderId);

                ordersHtml += `
                    <div class="order-item">
                        <h4>Order ID: ${orderId}</h4>
                        <p><strong>Credit ID:</strong> ${orderInfo.creditId}</p>
                        <p><strong>Seller:</strong> ${orderInfo.seller}</p>
                        <p><strong>Status:</strong> ${orderInfo.isFulfilled ? 'Fulfilled' : (orderInfo.isActive ? 'Active' : 'Cancelled')}</p>
                        <p><strong>Created:</strong> ${new Date(orderInfo.timestamp * 1000).toLocaleDateString()}</p>
                        <div class="order-actions">
                            ${orderInfo.isActive && !orderInfo.isFulfilled ?
                                `<button class="btn btn-danger" onclick="cancelOrder(${orderId})">Cancel Order</button>` : ''}
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error loading order ${orderId}:`, error);
            }
        }

        ordersList.innerHTML = ordersHtml;

    } catch (error) {
        console.error('Error loading user orders:', error);
        document.getElementById('ordersList').innerHTML = '<p>Error loading orders.</p>';
    }
}

// Load pending orders (for sellers)
async function loadPendingOrders() {
    try {
        if (!contract || !userAddress) return;

        const pendingOrdersList = document.getElementById('pendingOrdersList');
        pendingOrdersList.innerHTML = '<p class="loading">Loading pending orders...</p>';

        const stats = await contract.getSystemStats();
        const totalOrders = stats.totalOrders.toNumber();

        if (totalOrders === 0) {
            pendingOrdersList.innerHTML = '<p>No orders in the system yet.</p>';
            return;
        }

        let pendingOrdersHtml = '';

        for (let i = 1; i <= totalOrders; i++) {
            try {
                const orderInfo = await contract.getOrderInfo(i);

                if (orderInfo.seller.toLowerCase() === userAddress.toLowerCase() &&
                    orderInfo.isActive && !orderInfo.isFulfilled) {

                    pendingOrdersHtml += `
                        <div class="order-item">
                            <h4>Order ID: ${i}</h4>
                            <p><strong>Buyer:</strong> ${orderInfo.buyer}</p>
                            <p><strong>Credit ID:</strong> ${orderInfo.creditId}</p>
                            <p><strong>Created:</strong> ${new Date(orderInfo.timestamp * 1000).toLocaleDateString()}</p>
                            <div class="order-actions">
                                <button class="btn btn-primary" onclick="executeTrade(${i})">Execute Trade</button>
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error(`Error loading order ${i}:`, error);
            }
        }

        pendingOrdersList.innerHTML = pendingOrdersHtml || '<p>No pending orders for you as a seller.</p>';

    } catch (error) {
        console.error('Error loading pending orders:', error);
        document.getElementById('pendingOrdersList').innerHTML = '<p>Error loading pending orders.</p>';
    }
}

// Cancel order
async function cancelOrder(orderId) {
    try {
        if (!contract) {
            alert('Please connect your wallet first');
            return;
        }

        if (confirm('Are you sure you want to cancel this order?')) {
            const tx = await contract.cancelOrder(orderId);
            await tx.wait();

            alert('Order cancelled successfully!');
            await loadUserOrders();
        }

    } catch (error) {
        console.error('Error cancelling order:', error);
        alert(`Failed to cancel order: ${error.message}`);
    }
}

// Execute trade
async function executeTrade(orderId) {
    try {
        if (!contract) {
            alert('Please connect your wallet first');
            return;
        }

        if (confirm('Are you sure you want to execute this trade?')) {
            const tx = await contract.executeTrade(orderId);
            await tx.wait();

            alert('Trade executed successfully!');
            await loadPendingOrders();
            await refreshBalances();
        }

    } catch (error) {
        console.error('Error executing trade:', error);
        alert(`Failed to execute trade: ${error.message}`);
    }
}

// Refresh balances
async function refreshBalances() {
    try {
        if (!contract || !userAddress) return;

        const balanceInfo = document.getElementById('balanceInfo');
        balanceInfo.innerHTML = '<p class="loading">Loading balances...</p>';

        const isRegistered = await contract.isUserRegistered(userAddress);

        if (!isRegistered) {
            balanceInfo.innerHTML = '<p>Please register first to view balances.</p>';
            return;
        }

        // Note: In a real FHEVM implementation, these encrypted values would need
        // to be decrypted client-side. For this demo, we'll show that they're encrypted.
        const balances = await contract.getMyBalances();

        balanceInfo.innerHTML = `
            <div class="balance-item">
                <span class="balance-label">Credit Balance:</span>
                <span class="balance-value">Encrypted (${balances.encryptedCreditBalance})</span>
            </div>
            <div class="balance-item">
                <span class="balance-label">Token Balance:</span>
                <span class="balance-value">Encrypted (${balances.encryptedTokenBalance})</span>
            </div>
            <div class="balance-item">
                <span class="balance-label">Registration Status:</span>
                <span class="balance-value">Registered</span>
            </div>
        `;

    } catch (error) {
        console.error('Error refreshing balances:', error);
        document.getElementById('balanceInfo').innerHTML = '<p>Error loading balances.</p>';
    }
}

// Load system statistics
async function loadSystemStats() {
    try {
        if (!contract) {
            // If no contract, show placeholder
            document.getElementById('systemStats').innerHTML = '<p>Connect wallet to view system statistics.</p>';
            return;
        }

        const stats = await contract.getSystemStats();

        document.getElementById('systemStats').innerHTML = `
            <div class="stats-item">
                <span class="stats-label">Total Credits Issued:</span>
                <span class="stats-value">${stats.totalCredits}</span>
            </div>
            <div class="stats-item">
                <span class="stats-label">Total Orders Created:</span>
                <span class="stats-value">${stats.totalOrders}</span>
            </div>
        `;

    } catch (error) {
        console.error('Error loading system stats:', error);
        document.getElementById('systemStats').innerHTML = '<p>Error loading system statistics.</p>';
    }
}

// Utility function to show status messages
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `status-message ${type}`;
    }
}

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            location.reload();
        } else {
            // User switched accounts
            location.reload();
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        // User switched networks
        location.reload();
    });
}