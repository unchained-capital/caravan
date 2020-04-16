export const SET_REDEEM_SCRIPT = "SET_REDEEM_SCRIPT";

export function setRedeemScript(redeemScript) {
  return {
    type: SET_REDEEM_SCRIPT,
    value: redeemScript,
  };
}
