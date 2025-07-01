mod btc;
mod p2tr;
mod schnorr;
mod service;

use btc::BitcoinContext;
use candid::Principal;
use ic_cdk::export_candid;
use ic_cdk::{bitcoin_canister::Network, init, post_upgrade};

use std::cell::Cell;

fn auth_guard() -> Result<(), String> {
    match ic_cdk::api::msg_caller() {
        caller if caller == Principal::anonymous() => {
            Err("Calls with the anonymous principal are not allowed.".to_string())
        }
        _ => Ok(()),
    }
}

// Global, thread-local instance of the Bitcoin context.
// This is initialized at smart contract init/upgrade time and reused across all API calls.
thread_local! {
    static BTC_CONTEXT: Cell<BitcoinContext> = const {
        Cell::new(BitcoinContext {
            network: Network::Testnet,
            bitcoin_network: bitcoin::Network::Testnet,
            key_name: "test_key_1",
        })
    };
}

/// Internal shared init logic used both by init and post-upgrade hooks.
fn init_upgrade(network: Network) {
    let key_name = match network {
        Network::Regtest => "dfx_test_key",
        Network::Mainnet | Network::Testnet => "test_key_1",
    };

    let bitcoin_network = match network {
        Network::Mainnet => bitcoin::Network::Bitcoin,
        Network::Testnet => bitcoin::Network::Testnet,
        Network::Regtest => bitcoin::Network::Regtest,
    };

    BTC_CONTEXT.with(|ctx| {
        ctx.set(BitcoinContext {
            network,
            bitcoin_network,
            key_name,
        })
    });
}

/// Smart contract init hook.
/// Sets up the BitcoinContext based on the given IC Bitcoin network.
#[init]
pub fn init(network: Network) {
    init_upgrade(network);
}

/// Post-upgrade hook.
/// Reinitializes the BitcoinContext with the same logic as `init`.
#[post_upgrade]
fn upgrade(network: Network) {
    init_upgrade(network);
}

/// Input structure for sending Bitcoin.
/// Used across P2PKH, P2WPKH, and P2TR transfer endpoints.
#[derive(candid::CandidType, candid::Deserialize)]
pub struct SendRequest {
    pub destination_address: String,
    pub amount_in_satoshi: u64,
}

// Re-export SendBtcRequest for Candid interface generation
pub use service::send_btc::SendBtcRequest;

export_candid!();
