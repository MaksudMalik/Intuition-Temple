// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IntuitionTemple {
    mapping(address => uint256) public lastPray;
    event Prayed(address indexed user, uint256 timestamp);

    function Pray() public {
        require(
            block.timestamp >= lastPray[msg.sender] + 24 hours,
            "You can pray only once every 24 hours"
        );

        lastPray[msg.sender] = block.timestamp;
        emit Prayed(msg.sender, block.timestamp);
    }

    function canPray(address user) public view returns (bool) {
        return block.timestamp >= lastPray[user] + 24 hours;
    }
}
