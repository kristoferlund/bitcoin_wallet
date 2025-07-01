use bitcoin::{key::Secp256k1, Address, PublicKey, XOnlyPublicKey};
use candid::Principal;
use ic_cdk::update;

use crate::{schnorr::get_schnorr_public_key, BTC_CONTEXT};

/// Returns a Taproot (P2TR) address of this smart contract that supports **key path spending only**.
///
/// This address does not commit to a script path (it commits to an unspendable path per BIP-341).
/// It allows spending using a single Schnorr signature corresponding to the internal key.
#[update]
pub async fn get_address(principal: Option<Principal>) -> Result<String, String> {
    // If no principal is specified in call, use caller principal
    let principal = principal.unwrap_or_else(ic_cdk::api::msg_caller);

    // The Bitcoin context contains information about the currently selected Bitcoin network and the Bitcoin canister.
    let ctx = BTC_CONTEXT.with(|ctx| ctx.get());

    // Derive the public key used as the internal key (untweaked key path base).
    // This key is used for key path spending only, without any committed script tree.
    let internal_key = get_schnorr_public_key(&ctx, vec![principal.as_slice().to_vec()]).await;

    // Convert the internal key to an x-only public key, as required by Taproot (BIP-341).
    let internal_key = XOnlyPublicKey::from(PublicKey::from_slice(&internal_key).unwrap());

    // Create a Taproot address using the internal key only.
    // We pass `None` as the Merkle root, which per BIP-341 means the address commits
    // to an unspendable script path, enabling only key path spending.
    let secp256k1_engine = Secp256k1::new();
    let address = Address::p2tr(&secp256k1_engine, internal_key, None, ctx.bitcoin_network);

    Ok(address.to_string())
}
