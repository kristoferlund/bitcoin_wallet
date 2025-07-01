use bitcoin::{key::Secp256k1, Address, PublicKey, XOnlyPublicKey};
use candid::Principal;
use ic_cdk::{
    bitcoin_canister::{bitcoin_get_balance, GetBalanceRequest},
    update,
};

use crate::{schnorr::get_schnorr_public_key, BTC_CONTEXT};

/// Get the Bitcoin balance for the caller or a specified principal.
#[update]
pub async fn get_balance(principal: Option<Principal>) -> Result<u64, String> {
    // If no principal is specified in call, use caller principal
    let principal = principal.unwrap_or_else(ic_cdk::api::msg_caller);

    // The Bitcoin context contains information about the currently selected Bitcoin network and the Bitcoin canister.
    let ctx = BTC_CONTEXT.with(|ctx| ctx.get());

    // Derive the public key for the address
    let internal_key = get_schnorr_public_key(&ctx, vec![principal.as_slice().to_vec()]).await;
    let internal_key = XOnlyPublicKey::from(PublicKey::from_slice(&internal_key).unwrap());

    // Create the Taproot address
    let secp256k1_engine = Secp256k1::new();
    let address = Address::p2tr(&secp256k1_engine, internal_key, None, ctx.bitcoin_network);

    // Query the Bitcoin network for the balance
    let balance = bitcoin_get_balance(&GetBalanceRequest {
        address: address.to_string(),
        network: ctx.network,
        min_confirmations: None,
    })
    .await
    .map_err(|e| format!("Failed to get balance: {:?}", e))?;

    Ok(balance)
}
