module sui_examples::buidl_coin {
    use sui_examples::coin;

    struct BUIDL has drop {}

    // This allows anyone to create BUIDL coin
    public entry fun create(ctx: &mut TxContext) {
        // Create the treasury capability; this allows us to mint coins and it tracks the total circulating supply
        let treasury_cap = coin::create_currency(BUIDL { }, ctx);

        // Send to the transaction sender
        let one_hundred_million = coin::mint(treasury_cap, 100_000_000, ctx);
        transfer::transfer(treasury_cap, tx_context::sender(ctx));
    }

    // This is how you would actually do it in production
    // Init functions canonly be run once, on deploy!
    // fun init(one_time_witness: BUIDL_COIN, ctx: &mut TxContext) {
    //     let treasury_cap = coin::create_currency(one_time_witness, ctx);
    //     transfer::transfer(treasury_cap, tx_context::sender(ctx));
    // }
}