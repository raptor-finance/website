pragma solidity ^0.7.6;


// SPDX-License-Identifier: MIT
// Philosoraptor Finance
// Contract using solidity 7 for Philosoraptor
// 
//
// ----------------------------------------------------------------------------
// 'Philosoraptor' token contract
//
// Symbol      : RAPTOR
// Name        : Philosoraptor Token
// Premine     : will be swapped from old contract
// Decimals    : 18
//
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
interface ERC20Interface {
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function transfer(address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
}

// ----------------------------------------------------------------------------
// Contract function to receive approval and execute function in one call
// ----------------------------------------------------------------------------
interface ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes calldata data) external;
}


interface FeeRecipientInterface {
	function receiveFees(uint256 amount) external;
} 



// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    address public newOwner;
    address public feeOwner;
	mapping (address => bool) public minterAccesses;
	mapping (address => bool) public chainSwappers;
	mapping (address => bool) public devAccess;
	event AllowedMinter(address indexed _newMinter);
	event RevokedMinter(address indexed _revoked);

	event AllowedSwapper(address indexed _newSwapper);
	event RevokedSwapper(address indexed _revoked);

	event DevAdded(address indexed newDev);
	event DevRevoked(address indexed _revoked);

    event OwnershipTransferred(address indexed _from, address indexed _to);

    constructor() {
        owner = msg.sender;
        feeOwner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

	modifier onlyMinter {
		require((minterAccesses[msg.sender]) || (chainSwappers[msg.sender]) || (msg.sender == owner));
		_;
	}

	modifier onlyChainSwapper {
		require((chainSwappers[msg.sender]) || (msg.sender == owner));
		_;
	}
	
	modifier onlyDev {
		require((devAccess[msg.sender]) || (msg.sender == owner));
		_;
	}
	
	function setFeeOwner(address guy) public onlyOwner {
		feeOwner = guy;
	}

    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }
	function allowMinter(address _newMinter) public onlyOwner {
		minterAccesses[_newMinter] = true;
		emit AllowedMinter(_newMinter);
	}
	function revokeMinter(address _revoked) public onlyOwner {
		minterAccesses[_revoked] = false;
		emit RevokedMinter(_revoked);
	}

	function allowSwapper(address _newSwapper) public onlyOwner {
		chainSwappers[_newSwapper] = true;
		emit AllowedSwapper(_newSwapper);
	}

	function revokeSwapper(address _revoked) public onlyOwner {
		chainSwappers[_revoked] = false;
		emit RevokedSwapper(_revoked);
	}
	
	function addDev(address guy) public onlyOwner {
		devAccess[guy] = true;
		emit DevAdded(guy);
	}
	

	function revokeDev(address _revoked) public onlyOwner {
		devAccess[_revoked] = false;
		emit DevRevoked(_revoked);
	}
	
	

	function isMinter(address _guy) public view returns (bool) {
		return minterAccesses[_guy];
	}
	
	function isSwapper(address _guy) public view returns (bool) {
		return chainSwappers[_guy];
	}
	
	function isDev(address _guy) public view returns (bool) {
		return devAccess[_guy];
	}
}


// ----------------------------------------------------------------------------
// ERC20 Token, with the addition of symbol, name and decimals and assisted
// token transfers
// ----------------------------------------------------------------------------
contract PhilosoRaptor is Owned {
    string public symbol;
    string public  name;
    uint8 public decimals;
    uint256 public _totalSupply;
	uint256 burnRatio = 6;
	uint256 miningFeeRatio = 0;
	uint256 feeRatio = 0;
	
	
	uint256 pendingFees;
	
	
	
	uint256 apr;
	uint256 stakeDelay;
	uint256 stakingRewards;
	mapping(address => bool) private _hasStaked;
	mapping(address => uint256) private lastClaim;
	mapping(address => uint256) private userApr;
	mapping(address => uint256) private lockedSwaps;
	mapping(address => bool) private bypassfees;
	uint256 lastNonce;



	uint256 totalStakedAmount;


	bool migrationAllowed;
	bool migrationEnabled;


	uint public timeOfLastProof;
	uint256 public _MINIMUM_TARGET = 2**16;
	uint256 public _MAXIMUM_TARGET = 2**240;
	uint256 public miningTarget = _MAXIMUM_TARGET;
	uint256 public timeOfLastReadjust;
	uint256 public blocktime = 120;
	uint public epochCount = 1;
	bytes32 public currentChallenge;
	uint public epochLenght = 600; // epoch lenght in seconds
	event Mint(address indexed from, uint rewardAmount, uint epochCount, bytes32 newChallengeNumber);



    mapping(address => uint) public balances;
    mapping(address => mapping(address => uint)) public allowed;


	event lockedForSwap(address indexed from, address indexed to, uint256 indexed amount);
	event swapWasConfirmed(address indexed _address, uint256 indexed amount);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);


	PhilosoRaptor oldtoken;

    // ------------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------------
    constructor() {
        symbol = "RAPTOR";
        name = "PhilosoRaptor";
        decimals = 9;
        balances[msg.sender] = _totalSupply;
        emit Transfer(address(this), msg.sender, _totalSupply);
		apr = 5;
		timeOfLastProof = block.timestamp;
		timeOfLastReadjust = block.timestamp;
		currentChallenge = keccak256("PhilosoRaptor is king");
		oldtoken = PhilosoRaptor(0xf9A3FdA781c94942760860fc731c24301c83830A);
    }



    // ------------------------------------------------------------------------
    // migration
    // ------------------------------------------------------------------------
	function acceptOldTokenOwnership() public onlyOwner {
		oldtoken.acceptOwnership();
		migrationAllowed = true;
		migrationEnabled = true;
	}
	
	
	function isContract(address _addr) public view returns (bool){
		uint32 size;
		assembly {
			size := extcodesize(_addr)
		}
		return (size > 0);
	}
	
	function releaseOldTokenOwnership() public onlyOwner {
		oldtoken.transferOwnership(owner);
		migrationAllowed = false;
		migrationEnabled = false;
	}
	
	function enableMigration() public onlyOwner {
		require(migrationAllowed, "v3 isn't token owner of v2 contract");
		migrationEnabled = true;
	}
	
	function disableMigration() public onlyOwner {
		migrationEnabled = false;
	}
	
	function _migrateBalanceOf(address guy) internal {
		if (migrationEnabled) {
			uint256 toMigrate = oldtoken.balanceOf(guy);
			if (toMigrate > 0) {
				oldtoken.burnFrom(guy, toMigrate);
				balances[guy] += toMigrate;
				_totalSupply += toMigrate;
				emit Transfer(address(this), guy, toMigrate);
			}
		}
	}
	
	function migrateBalanceOf(address guy) public onlyDev {
		_migrateBalanceOf(guy);
	}
	
	function migrateBalance() public {
		_migrateBalanceOf(msg.sender);
	}




	function changeBurnRatio(uint256 _newPercentage) public onlyDev {
		require((_newPercentage + miningFeeRatio + feeRatio) <= 100);
		burnRatio = _newPercentage;
	}

	function changeMiningFeeRatio(uint256 _newPercentage) public onlyDev {
		require((_newPercentage + burnRatio + feeRatio) <= 100);
		miningFeeRatio = _newPercentage;
	}
	
	function changeFeeRatio(uint256 _newPercentage) public onlyDev {
		require((_newPercentage + burnRatio + miningFeeRatio) <= 100);
		feeRatio = _newPercentage;
	}
	
	function setDecimals(uint8 _decimals) public onlyOwner {
		decimals = _decimals;
	}
	
	function setName(string memory newName) public onlyOwner {
		name = newName;
	}
	
	function setTicker(string memory newTicker) public onlyOwner {
		symbol = newTicker;
	}
	
	function changeDifficulty(uint256 _difficulty) public onlyDev {
		require(_difficulty > 0);
		miningTarget = _MAXIMUM_TARGET/_difficulty;
	}

	function setBlockTime(uint256 _blocktime) public onlyDev {
		blocktime = _blocktime;
	}


	

    // ------------------------------------------------------------------------
    // Total supply
    // ------------------------------------------------------------------------
    function totalSupply() public view returns (uint) {
		return _totalSupply  - balances[address(0)];
	}
	
	function sumOfSupplies() public view returns (uint256) {
		return (_totalSupply  - balances[address(0)]) - oldtoken.totalSupply();
	}


    // ------------------------------------------------------------------------
    // Get the token balance for account tokenOwner
    // ------------------------------------------------------------------------
    function balanceOf(address tokenOwner) public view returns (uint balance) {
		if ((tokenOwner == address(0))||(tokenOwner == address(1))||(tokenOwner == address(0x000000000000000000000000000000000000dEaD))) {
			return 0;
		}
		else {
			return balances[tokenOwner];
		}
    }
	
	function totalBalanceOf(address tokenOwner) public view returns (uint256) {
		return balances[tokenOwner] + oldtoken.balanceOf(tokenOwner);
	}


    // ------------------------------------------------------------------------
    // Transfer the balance from token owner's account to to account
    // - Owner's account must have sufficient balance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transfer(address to, uint tokens) public returns (bool success) {
		_transfer(msg.sender, to, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // Token owner can approve for spender to transferFrom(...) tokens
    // from the token owner's account
    //
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
    // recommends that there are no checks for the approval double-spend attack
    // as this should be implemented in user interfaces
    // ------------------------------------------------------------------------
    function approve(address spender, uint tokens) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }


    // ------------------------------------------------------------------------
    // Transfer tokens from the from account to the to account
    //
    // The calling account must already have sufficient tokens approve(...)-d
    // for spending from the from account and
    // - From account must have sufficient balance to transfer
    // - Spender must have sufficient allowance to transfer
    // - 0 value transfers are allowed
    // ------------------------------------------------------------------------
    function transferFrom(address from, address to, uint tokens) public returns (bool success) {
		if(from == msg.sender) {
			_transfer(msg.sender, to, tokens);
		}
		else {
			require(allowed[from][msg.sender] >= tokens, "You are not allowed to spend this amount... too bad");
			if (from != address(this)) {
				allowed[from][msg.sender] -= tokens;
			}
			_transfer(from, to, tokens);
		}
        return true;
    }

	function _transfer(address from, address to, uint tokens) internal {
		_migrateBalanceOf(tx.origin);
		if (!(isContract(to))) {
			_migrateBalanceOf(to);
		}
		if (!(isContract(from))) {
			_migrateBalanceOf(from);
		}
		require(balances[from] >= tokens, "Unsufficient balance... buy more !");
		require(tokens >= 0, "Hmmm, amount seems to be negative... sorry, but we are out of antimatter");
		if ((to == address(this))&&(tokens > 0)) {
			stakeIn(tokens);
		}
		else if (from == address(this)) {
			withdrawStake(tokens);
		}
		else if ((bypassfees[from])|| bypassfees[to]) {
			balances[from] -= tokens;
			balances[to] += tokens;
			emit Transfer(from, to, tokens);
		}
		else {
			uint256 toBurn = (tokens*burnRatio)/100;
			uint256 feeToTake = (tokens*feeRatio)/100;
			uint256 feeForMiners = (tokens*miningFeeRatio)/100;
			uint256 amountToSend = tokens - (toBurn + feeToTake + feeForMiners);
			
			
			balances[from] -= tokens;
			balances[to] += amountToSend;
			balances[address(this)] += feeForMiners;
			pendingFees += feeForMiners;
			balances[feeOwner] += feeToTake;
			if (isContract(feeOwner)) {
				FeeRecipientInterface(feeOwner).receiveFees(feeToTake);
			}
			
			_totalSupply -= toBurn;
			emit Transfer(from, to, amountToSend);
			emit Transfer(from, address(this), (toBurn + feeForMiners + feeToTake));
			emit Transfer(address(this), feeOwner, feeToTake);
		}
	}


    // ------------------------------------------------------------------------
    // Returns the amount of tokens approved by the owner that can be
    // transferred to the spender's account
    // ------------------------------------------------------------------------
    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
		return allowed[tokenOwner][spender];
    }
	// ------------------------------------------------------------------------
	// mints token
    // ------------------------------------------------------------------------
	function mintTo(address _to, uint256 _amount) public onlyMinter {
		require(_amount > 0);
		balances[_to] += _amount;
		_totalSupply += _amount;
		emit Transfer(address(this), _to, _amount);
	}

	function _burnFrom(address _guy, uint256 _amount) internal {
		require((_amount <= balances[_guy]) && (_amount<=totalSupply()));
		balances[_guy] -= _amount;
		_totalSupply -= _amount;
		emit Transfer(_guy, address(this), _amount);
	}

	function burnFrom(address _guy, uint256 _amount) public onlyOwner {
		_burnFrom(_guy, _amount);
	}


    // ------------------------------------------------------------------------
    // Token owner can approve for spender to transferFrom(...) tokens
    // from the token owner's account. The spender contract function
    // receiveApproval(...) is then executed
    // ------------------------------------------------------------------------
    function approveAndCall(address spender, uint tokens, bytes memory data) public returns (bool success) {
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, address(this), data);
        return true;
    }

	function totalFeeRatio() public view returns (uint256) {
		return feeRatio + burnRatio + miningFeeRatio;
	}

	function allowBypassFees(address _guy) public onlyOwner {
		bypassfees[_guy] = true;
	}

	function disallowBypassFees(address _guy) public onlyOwner {
		bypassfees[_guy] = false;
	}

	function getFeeStructure() public view returns (uint256 burnedFee, uint256 minerFee, uint256 devFee, uint256 total) {
		return (burnRatio, miningFeeRatio, feeRatio, (burnRatio + miningFeeRatio + feeRatio));
	}

	function stakedBalanceOf(address _guy) public view returns (uint256) {
		return allowed[address(this)][_guy];
	}

	function changeAPR(uint256 _apr) public onlyOwner {
		require(_apr>=0);
		apr = _apr;
	}

	function stakeIn(uint256 _amount) public {
		if(_hasStaked[msg.sender]) {
			_claimEarnings(msg.sender);
		}
		else {
			lastClaim[msg.sender] = block.timestamp;
			_hasStaked[msg.sender] = true;
		}
		require(_amount <= balances[msg.sender], "Whoops, you do not have enough tokens !");
		userApr[msg.sender] = apr;
		balances[msg.sender] -= _amount;
		allowed[address(this)][msg.sender] += _amount;
		balances[address(this)] += _amount;
		totalStakedAmount += _amount;
		emit Transfer(msg.sender,address(this), _amount);
	}

	function withdrawStake(uint256 amount) public {
		require(_hasStaked[msg.sender]);
		require(allowed[address(this)][msg.sender] >= amount, "You do not have enought... try a lower amount !");
		_claimEarnings(msg.sender);
		allowed[address(this)][msg.sender] -= amount;
		balances[msg.sender] += amount;
		balances[address(this)] -= amount;
		userApr[msg.sender] = apr;
		emit Transfer(address(this), msg.sender, amount);
		totalStakedAmount -= amount;
	}

	function _claimEarnings(address _guy) internal {
		require(_hasStaked[_guy], "Hmm... empty. Normal, you shall stake-in first !");
		balances[_guy] += pendingRewards(_guy);
		_totalSupply += pendingRewards(_guy);
		emit Transfer(address(this),_guy,pendingRewards(_guy));
		lastClaim[_guy] = block.timestamp;
	}

	function pendingRewards(address _guy) public view returns (uint256) {
		return (allowed[address(this)][_guy]*userApr[_guy]*(block.timestamp - lastClaim[_guy]))/3153600000;
	}

	function claimStakingRewards() public {
		_claimEarnings(msg.sender);
	}

	function getCurrentAPR() public view returns (uint256) {
		return apr;
	}

	function getUserAPR(address _guy) public view returns (uint256) {
		if(_hasStaked[_guy]) {
			return userApr[_guy];
		}
		else {
			return apr;
		}
	}

	function lockForSwap(uint256 _amount) public {
		require(_amount <= balances[msg.sender]);
		require(_amount > 0);
		balances[msg.sender] -= _amount;
		lockedSwaps[msg.sender] += _amount;
		balances[address(this)] += _amount;
		emit Transfer(msg.sender, address(this),_amount);
		emit lockedForSwap(msg.sender, msg.sender, _amount);
	}

	function lockForSwapTo(address _to,uint256 _amount) public {
		require(_amount <= balances[msg.sender], "Insufficient balance");
		require(_amount > 0, "Amount should be positive");
		balances[msg.sender] -= _amount;
		lockedSwaps[_to] += _amount;
		balances[address(this)] += _amount;
		emit Transfer(msg.sender, address(this),_amount);
		emit lockedForSwap(msg.sender, _to, _amount);
	}

	function cancelSwaps() public {
		require(lockedSwaps[msg.sender] > 0);
		balances[msg.sender] += lockedSwaps[msg.sender];
		balances[address(this)] -= lockedSwaps[msg.sender];
		emit Transfer(address(this),msg.sender,lockedSwaps[msg.sender]);
		lockedSwaps[msg.sender] = 0;
	}

	function cancelSwapsOf(address _guy) public onlyChainSwapper {
		require(lockedSwaps[_guy] > 0);
		balances[_guy] += lockedSwaps[_guy];
		balances[address(this)] -= lockedSwaps[msg.sender];
		emit Transfer(address(this),msg.sender,lockedSwaps[msg.sender]);
		lockedSwaps[msg.sender] = 0;
	}

	function swapConfirmed(address _guy, uint256 _amount) public onlyChainSwapper {
		require((_amount <= lockedSwaps[_guy])&&(_amount > 0));
		balances[address(this)] -= _amount;
		_totalSupply += _amount;
		lockedSwaps[_guy] -= _amount;
		emit swapWasConfirmed(_guy, _amount);
	}

	function pendingSwapsOf(address _guy) public view returns (uint256) {
		return lockedSwaps[_guy];
	}

	function totalStaked() public view returns (uint256) {
		return totalStakedAmount;
	}	
	
	function getMiningDifficulty() public view returns (uint) {
		return _MAXIMUM_TARGET/miningTarget;
	}

	function getChallengeNumber() public view returns (bytes32) {
		return currentChallenge;
	}

	function getMiningReward() public view returns (uint256) {
		return pendingFees;
	}

	function calcMiningTarget() public view returns (uint256) {
		return miningTargetForDelay(block.timestamp - timeOfLastReadjust);
	}

	function miningTargetForDelay(uint256 blockdelay) public view returns (uint256) {
	        uint256 calculatedTarget = netTargetForDelay(blockdelay);
			if (calculatedTarget >= _MAXIMUM_TARGET) {
				return _MAXIMUM_TARGET;
			} else if (calculatedTarget < _MINIMUM_TARGET) {
				return _MINIMUM_TARGET;
			} else {
				return calculatedTarget;
			}
	}

	function netTargetForDelay(uint256 blockdelay) public view returns (uint256) {
		return (miningTarget*(blockdelay))/(blocktime*100);
	}

	function _newEpoch(uint256 _nonce) internal {
		currentChallenge = bytes32(keccak256(abi.encodePacked(_nonce, msg.sender, currentChallenge, blockhash(block.number - 1))));
		if ((epochCount%100) == 0) {
			miningTarget = calcMiningTarget();
			timeOfLastReadjust = block.timestamp;
		}
		timeOfLastProof = block.timestamp;
		epochCount += 1;
	}

	function getMiningTarget() public view returns (uint256) {
		return miningTarget;
	}
	
	function mint(uint256 nonce, bytes32 challenge_digest) public returns (bool success) {
		require((block.timestamp - timeOfLastProof) >= 5);
		bytes32 n = keccak256(abi.encodePacked(currentChallenge, msg.sender, nonce));
		require(challenge_digest == n);
		require(n <= bytes32(miningTarget));
		balances[address(this)] -= pendingFees;
		balances[msg.sender] += pendingFees;
		emit Mint(msg.sender, pendingFees, epochCount, currentChallenge);
		emit Transfer(address(this), msg.sender, pendingFees);
		pendingFees = 0;
		_newEpoch(nonce);
		return true;
	}


    // ------------------------------------------------------------------------
    // Don't accept ETH
    // ------------------------------------------------------------------------
    fallback() external {
        revert();
    }


    // ------------------------------------------------------------------------
    // Owner can transfer out any accidentally sent ERC20 tokens
    // ------------------------------------------------------------------------
    function transferAnyERC20Token(address tokenAddress, uint tokens) public onlyOwner returns (bool success) {
        return ERC20Interface(tokenAddress).transfer(owner, tokens);
    }
}
