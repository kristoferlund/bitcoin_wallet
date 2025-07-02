use bitcoin::{consensus::serialize, key::Secp256k1, Address, PublicKey, XOnlyPublicKey};
use ic_cdk::{
    bitcoin_canister::{
        bitcoin_get_utxos, bitcoin_send_transaction, GetUtxosRequest, SendTransactionRequest,
    },
    update,
};
use std::str::FromStr;

use crate::{
    auth_guard,
    btc::{get_fee_per_byte, PrimaryOutput},
    p2tr::{self},
    schnorr::{get_schnorr_public_key, sign_with_schnorr},
    BTC_CONTEXT,
};

/// Request structure for sending Bitcoin.
#[derive(candid::CandidType, candid::Deserialize)]
pub struct SendBtcRequest {
    pub destination_address: String,
    pub amount_in_satoshi: u64,
}

/// Sends Bitcoin from the caller's Taproot address to the specified destination.
///
/// This function constructs and broadcasts a transaction that spends from the caller's
/// unique Taproot output using key path spending only — that is, a single Schnorr
/// signature derived from the internal key with no script path committed.
#[update]
pub async fn send_btc(
    destination_address: String,
    amount_in_satoshi: u64,
) -> Result<String, String> {
    // Calls to send_btc need to be authenticated
    auth_guard()?;

    let ctx = BTC_CONTEXT.with(|ctx| ctx.get());

    if amount_in_satoshi == 0 {
        return Err("Amount must be greater than 0".to_string());
    }

    // Parse and validate the destination address. The address type needs to be
    // valid for the Bitcoin network we are on.
    let dst_address = Address::from_str(&destination_address)
        .map_err(|e| format!("Invalid destination address: {}", e))?
        .require_network(ctx.bitcoin_network)
        .map_err(|e| format!("Address not valid for network: {}", e))?;

    let sender_principal = ic_cdk::api::msg_caller();

    let internal_key_path = vec![sender_principal.as_slice().to_vec()];

    // Derive the public key used as the internal key (untweaked key path base).
    // This key is used for key path spending only, without any committed script tree.
    let internal_key = get_schnorr_public_key(&ctx, internal_key_path.clone()).await;

    // Convert the internal key to an x-only public key, as required by Taproot (BIP-341).
    let internal_key = XOnlyPublicKey::from(PublicKey::from_slice(&internal_key).unwrap());

    // Create a Taproot address using the internal key only.
    // We pass `None` as the Merkle root, which per BIP-341 means the address commits
    // to an unspendable script path, enabling only key path spending.
    let secp256k1_engine = Secp256k1::new();
    let own_address = Address::p2tr(&secp256k1_engine, internal_key, None, ctx.bitcoin_network);

    // Get all UTXOs for the sender's address.
    // Note that pagination may have to be used to get all UTXOs for the given address.
    // For the sake of simplicity, it is assumed here that the `utxo` field in the response
    // contains all UTXOs.
    let own_utxos = bitcoin_get_utxos(&GetUtxosRequest {
        address: own_address.to_string(),
        network: ctx.network,
        filter: None,
    })
    .await
    .map_err(|e| format!("Failed to get UTXOs: {:?}", e))?
    .utxos;

    if own_utxos.is_empty() {
        return Err("No UTXOs available for spending".to_string());
    }

    // Build the transaction
    let fee_per_byte = get_fee_per_byte(&ctx).await;
    let (transaction, prevouts) = p2tr::build_transaction(
        &ctx,
        &own_address,
        &own_utxos,
        p2tr::SelectUtxosMode::Greedy,
        &PrimaryOutput::Address(dst_address, amount_in_satoshi),
        fee_per_byte,
    )
    .await?;

    // Sign the transaction using key path spending.
    // For now, we use the mock signer since the actual Schnorr API integration
    // would require proper key derivation setup.
    let signed_transaction = p2tr::sign_transaction_key_spend(
        &ctx,
        &own_address,
        transaction,
        prevouts.as_slice(),
        internal_key_path,
        vec![], // No Merkle root for key-path-only spending
        sign_with_schnorr,
    )
    .await;

    // Send the transaction to the Bitcoin network.
    bitcoin_send_transaction(&SendTransactionRequest {
        network: ctx.network,
        transaction: serialize(&signed_transaction),
    })
    .await
    .map_err(|e| format!("Failed to send transaction: {:?}", e))?;

    // Return the transaction ID.
    Ok(signed_transaction.compute_txid().to_string())
}
