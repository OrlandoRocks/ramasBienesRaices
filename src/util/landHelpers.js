/** True when the land has no contract yet (available for new contract wizard). */
export function landHasNoContract(land) {
  const contractId = land?.contract_id;
  return contractId == null || contractId === "" || contractId === "no";
}

export function sameResidentialId(a, b) {
  if (a == null || a === "" || b == null || b === "") {
    return false;
  }
  return Number(a) === Number(b);
}
