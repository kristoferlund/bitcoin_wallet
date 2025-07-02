use crate::{
    btc::{build_transaction_with_fee, select_one_utxo, select_utxos_greedy, PrimaryOutput},
    schnorr::mock_sign_with_schnorr,
    BitcoinContext,
};
use bitcoin::{
    blockdata::witness::Witness,
    hashes::Hash,
    secp256k1::schnorr::Signature,
    sighash::{SighashCache, TapSighashType},
    Address, AddressType, ScriptBuf, Sequence, Transaction, TxOut,
};
use ic_cdk::bitcoin_canister::{MillisatoshiPerByte, Utxo};

pub enum SelectUtxosMode {
    Greedy,
    #[allow(dead_code)]
    Single,
}

// Builds a P2TR transaction to send the given `amount` of satoshis to the
// destination address.
pub(crate) async fn build_transaction(
    ctx: &BitcoinContext,
    own_address: &Address,
    own_utxos: &[Utxo],
    utxos_mode: SelectUtxosMode,
    primary_output: &PrimaryOutput,
    fee_per_byte: MillisatoshiPerByte,
) -> Result<(Transaction, Vec<TxOut>), String> {
    // We have a chicken-and-egg problem where we need to know the length
    // of the transaction in order to compute its proper fee, but we need
    // to know the proper fee in order to figure out the inputs needed for
    // the transaction.
    //
    // We solve this problem iteratively. We start with a fee of zero, build
    // and sign a transaction, see what its size is, and then update the fee,
    // rebuild the transaction, until the fee is set to the correct amount.
    let amount = match primary_output {
        PrimaryOutput::Address(_, amount) => *amount,
        PrimaryOutput::OpReturn(_) => 0,
    };
    let mut total_fee = 0;
    loop {
        let utxos_to_spend = match utxos_mode {
            SelectUtxosMode::Greedy => select_utxos_greedy(own_utxos, amount, total_fee),
            SelectUtxosMode::Single => select_one_utxo(own_utxos, amount, total_fee),
        }?;

        let (transaction, prevouts) =
            build_transaction_with_fee(utxos_to_spend, own_address, primary_output, total_fee)?;

        // Sign the transaction. In this case, we only care about the size
        // of the signed transaction, so we use a mock signer here for
        // efficiency.
        //
        // Note: it doesn't matter which particular spending path to use, key or
        // script path, since the difference is only how the signature is
        // computed, which is a dummy signing function in our case.
        let signed_transaction = sign_transaction_key_spend(
            ctx,
            own_address,
            transaction.clone(),
            &prevouts,
            vec![], // mock derivation path
            vec![],
            mock_sign_with_schnorr,
        )
        .await;

        let tx_vsize = signed_transaction.vsize() as u64;
        if (tx_vsize * fee_per_byte) / 1000 == total_fee {
            return Ok((transaction, prevouts));
        } else {
            total_fee = (tx_vsize * fee_per_byte) / 1000;
        }
    }
}

// Sign a P2TR key spend transaction.
//
// IMPORTANT: This method is for demonstration purposes only and it only
// supports signing transactions if:
//
// 1. All the inputs are referencing outpoints that are owned by `own_address`.
// 2. `own_address` is a P2TR address.
pub async fn sign_transaction_key_spend<SignFun, Fut>(
    ctx: &BitcoinContext,
    own_address: &Address,
    mut transaction: Transaction,
    prevouts: &[TxOut],
    derivation_path: Vec<Vec<u8>>,
    merkle_root_hash: Vec<u8>,
    signer: SignFun,
) -> Transaction
where
    SignFun: Fn(String, Vec<Vec<u8>>, Option<Vec<u8>>, Vec<u8>) -> Fut,
    Fut: std::future::Future<Output = Vec<u8>>,
{
    assert_eq!(own_address.address_type(), Some(AddressType::P2tr),);

    for input in transaction.input.iter_mut() {
        input.script_sig = ScriptBuf::default();
        input.witness = Witness::default();
        input.sequence = Sequence::ENABLE_RBF_NO_LOCKTIME;
    }

    let num_inputs = transaction.input.len();

    for i in 0..num_inputs {
        let mut sighasher = SighashCache::new(&mut transaction);

        let signing_data = sighasher
            .taproot_key_spend_signature_hash(
                i,
                &bitcoin::sighash::Prevouts::All(prevouts),
                TapSighashType::Default,
            )
            .expect("Failed to encode signing data")
            .as_byte_array()
            .to_vec();

        let raw_signature = signer(
            ctx.key_name.to_string(),
            derivation_path.clone(),
            Some(merkle_root_hash.clone()),
            signing_data.clone(),
        )
        .await;

        // Update the witness stack.
        let witness = sighasher.witness_mut(i).unwrap();
        let signature = bitcoin::taproot::Signature {
            signature: Signature::from_slice(&raw_signature).expect("failed to parse signature"),
            sighash_type: TapSighashType::Default,
        };
        witness.push(signature.to_vec());
    }

    transaction
}
