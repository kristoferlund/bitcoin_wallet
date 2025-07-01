export const idlFactory = ({ IDL }) => {
  const Network = IDL.Variant({
    'mainnet' : IDL.Null,
    'regtest' : IDL.Null,
    'testnet' : IDL.Null,
  });
  const AddressResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const BalanceResult = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const BitcoinAddress = IDL.Text;
  const Satoshi = IDL.Nat64;
  const SendResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'get_address' : IDL.Func([IDL.Opt(IDL.Principal)], [AddressResult], []),
    'get_balance' : IDL.Func([IDL.Opt(IDL.Principal)], [BalanceResult], []),
    'send_btc' : IDL.Func([BitcoinAddress, Satoshi], [SendResult], []),
  });
};
export const init = ({ IDL }) => {
  const Network = IDL.Variant({
    'mainnet' : IDL.Null,
    'regtest' : IDL.Null,
    'testnet' : IDL.Null,
  });
  return [Network];
};
