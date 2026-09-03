// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WoofCash Kennel
/// Site https://woofcash.xyz · X https://x.com/woofcashXYZ · TG https://t.me/woofcashXYZ
contract Kennel {
    string public constant PROJECT = "WoofCash";
    string public constant TICKER = "WOOFCASH";
    string public constant PAIR = "WOOFCASH/AI";
    string public constant SITE = "https://woofcash.xyz";
    string public constant X = "https://x.com/woofcashXYZ";
    string public constant TELEGRAM = "https://t.me/woofcashXYZ";

    address public immutable owner;
    string public name;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address owner_, string memory name_) payable {
        require(owner_ != address(0), "owner");
        owner = owner_;
        name = name_;
        if (msg.value > 0) emit Deposited(msg.sender, msg.value);
    }

    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "not owner");
        require(amount <= address(this).balance, "balance");
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "xfer");
        emit Withdrawn(owner, amount);
    }

    function withdrawAll() external {
        require(msg.sender == owner, "not owner");
        uint256 amount = address(this).balance;
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "xfer");
        emit Withdrawn(owner, amount);
    }
}

contract KennelFactory {
    string public constant PROJECT = "WoofCash";
    string public constant SITE = "https://woofcash.xyz";
    string public constant X = "https://x.com/woofcashXYZ";
    string public constant TELEGRAM = "https://t.me/woofcashXYZ";
    uint256 public constant MIN_DEPOSIT = 10400000000000000;

    address[] public kennels;
    mapping(address => address[]) public kennelsOf;
    event KennelOpened(address indexed kennel, address indexed owner, string name, uint256 seed);

    function open(string calldata name) external payable returns (address kennel) {
        require(msg.value >= MIN_DEPOSIT, "min 0.0104");
        Kennel k = new Kennel{value: msg.value}(msg.sender, name);
        kennel = address(k);
        kennels.push(kennel);
        kennelsOf[msg.sender].push(kennel);
        emit KennelOpened(kennel, msg.sender, name, msg.value);
    }

    function count() external view returns (uint256) {
        return kennels.length;
    }
}
