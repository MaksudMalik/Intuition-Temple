export const contractAddress = "0x145B2aE919BeC9bBBE50C4336d519e2Bfe6b6786";

export const contractABI = [
	{
		"inputs": [],
		"name": "Pray",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Prayed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "canPray",
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastPray",
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

export const myCustomChainId = 13579;
export const customChain = {
    chainId: '0x' + myCustomChainId.toString(16),
    chainName: "Intuition Testnet",
    rpcUrls: ["https://testnet.rpc.intuition.systems/"],
    nativeCurrency: {
        name: "Intuition Token",
        symbol: "tTRUST",
        decimals: 18
    },
    blockExplorerUrls: ["https://testnet.explorer.intuition.systems/"]
};
