module sui_examples::buidl_coin {
    use sui::balance::{Self, Balance};
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui_examples::coin::{Self, Coin, TreasuryCap};

    struct BUIDL has drop {}

    // This allows anyone to create BUIDL coin
    public entry fun create_currency(ctx: &mut TxContext) {
        let treasury_cap = coin::create_currency(BUIDL { }, ctx);

        transfer::transfer(treasury_cap, tx_context::sender(ctx));
    }

    // This is how you would actually do it in production
    // Init functions canonly be run once, on deploy!
    // fun init(one_time_witness: BUIDL_COIN, ctx: &mut TxContext) {
    //     let treasury_cap = coin::create_currency(one_time_witness, ctx);
    //     transfer::transfer(treasury_cap, tx_context::sender(ctx));
    // }

    public entry fun mint_and_send(recipient: address, treasury_cap: &mut TreasuryCap<BUIDL>, ctx: &mut TxContext) {
        let one_hundred_million = coin::mint(treasury_cap, 100_000_000, ctx);

        transfer::transfer(one_hundred_million, recipient);
    }

    public entry fun split_and_send(coin: &mut Coin<BUIDL>, amount: u64, recipient: address, ctx: &mut TxContext) {
        let (new_coin) = coin::split(coin, amount, ctx);

        transfer::transfer(new_coin, recipient);
    }

    const ENOT_OWNER: u64 = 0;
    const EOVER_BUDGET: u64 = 1;
    const EINSUFFICIENT_FUNDS: u64 = 2;

    struct SharedBalance has key {
        id: UID,
        owner: address,
        balance: Balance<BUIDL>
    }

    public entry fun create_shared_balance(coin: Coin<BUIDL>, ctx: &mut TxContext) {
        let shared_balance = SharedBalance {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            balance: coin::into_balance(coin)
        };

        transfer::share_object(shared_balance);
    }

    struct Budget has key {
        id: UID,
        spending_limit: u64,
    }

    public entry fun issue_budget(shared_balance: &mut SharedBalance, amount: u64, recipient: address, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == shared_balance.owner, ENOT_OWNER);

        let budget = Budget {
            id: object::new(ctx),
            spending_limit: amount,
        };

        transfer::transfer(budget, recipient);
    }

    public entry fun redeem_budget(budget: &mut Budget, shared_balance: &mut SharedBalance, amount: u64, recipient: address, ctx: &mut TxContext) {
        assert!(budget.spending_limit >= amount, EOVER_BUDGET);
        assert!(balance::value(&shared_balance.balance) >= amount, EINSUFFICIENT_FUNDS);

        budget.spending_limit = budget.spending_limit - amount;
        
        let split_balance = balance::split(&mut shared_balance.balance, amount);

        let coin = coin::from_balance(split_balance, ctx);

        transfer::transfer(coin, recipient);
    }

}