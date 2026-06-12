// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Nexus - Simple transfer contract for demo
contract Nexus {
    address public owner;
    uint256 public transactionCount;

    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string note;
    }

    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256) public balances;

    event TransactionSent(
        uint256 indexed txId,
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event Deposited(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Deposit ETH into the contract
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Send ETH to another address with an optional note
    function sendFunds(address payable _to, string calldata _note) external payable {
        require(msg.value > 0, "Must send ETH");
        require(_to != address(0), "Invalid recipient");

        uint256 txId = transactionCount++;
        transactions[txId] = Transaction({
            from: msg.sender,
            to: _to,
            amount: msg.value,
            timestamp: block.timestamp,
            note: _note
        });

        (bool success, ) = _to.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit TransactionSent(txId, msg.sender, _to, msg.value, block.timestamp);
    }

    /// @notice Get transaction by ID
    function getTransaction(uint256 _txId) external view returns (Transaction memory) {
        return transactions[_txId];
    }

    /// @notice Get contract ETH balance
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
