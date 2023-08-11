/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_signature_free(a: number): void;
export function signature_sign(a: number, b: number, c: number): number;
export function signature_verify(a: number, b: number, c: number, d: number): number;
export function signature_from_string(a: number, b: number): number;
export function signature_to_string(a: number, b: number): void;
export function __wbg_privatekey_free(a: number): void;
export function privatekey_new(): number;
export function privatekey_from_seed_unchecked(a: number, b: number): number;
export function privatekey_from_string(a: number, b: number, c: number): void;
export function privatekey_to_string(a: number, b: number): void;
export function privatekey_to_view_key(a: number): number;
export function privatekey_to_address(a: number): number;
export function privatekey_sign(a: number, b: number, c: number): number;
export function privatekey_newEncrypted(a: number, b: number, c: number): void;
export function privatekey_toCiphertext(a: number, b: number, c: number, d: number): void;
export function privatekey_fromPrivateKeyCiphertext(a: number, b: number, c: number, d: number): void;
export function __wbg_address_free(a: number): void;
export function address_from_private_key(a: number): number;
export function address_from_view_key(a: number): number;
export function address_from_string(a: number, b: number): number;
export function address_verify(a: number, b: number, c: number, d: number): number;
export function address_to_x_coordinate(a: number, b: number): void;
export function address_from_bytes(a: number, b: number): number;
export function address_to_affine(a: number, b: number): void;
export function address_to_group(a: number, b: number): void;
export function address_add_fields(a: number, b: number, c: number, d: number, e: number): void;
export function address_sub_fields(a: number, b: number, c: number, d: number, e: number): void;
export function address_invert_field(a: number, b: number, c: number): void;
export function address_double_field(a: number, b: number, c: number): void;
export function address_mul_fields(a: number, b: number, c: number, d: number, e: number): void;
export function address_pow_field(a: number, b: number, c: number, d: number, e: number): void;
export function address_poseidon_hash(a: number, b: number, c: number): void;
export function address_sqrt(a: number, b: number, c: number): void;
export function address_add_points(a: number, b: number, c: number, d: number, e: number): void;
export function address_group_scalar_mul(a: number, b: number, c: number, d: number, e: number): void;
export function address_msm(a: number, b: number, c: number): void;
export function address_to_string(a: number, b: number): void;
export function address_to_projective(a: number, b: number): void;
export function __wbg_executionresponse_free(a: number): void;
export function executionresponse_getOutputs(a: number): number;
export function __wbg_feeexecution_free(a: number): void;
export function feeexecution_fee(a: number, b: number): void;
export function __wbg_viewkey_free(a: number): void;
export function viewkey_from_private_key(a: number): number;
export function viewkey_from_string(a: number, b: number): number;
export function viewkey_to_string(a: number, b: number): void;
export function viewkey_to_address(a: number): number;
export function viewkey_decrypt(a: number, b: number, c: number, d: number): void;
export function viewkey_to_scalar(a: number, b: number): void;
export function viewkey_view_key_ciphertext_multiply(a: number, b: number, c: number, d: number): void;
export function __wbg_transaction_free(a: number): void;
export function transaction_fromString(a: number, b: number, c: number): void;
export function transaction_toString(a: number, b: number): void;
export function transaction_transactionId(a: number, b: number): void;
export function transaction_transactionType(a: number, b: number): void;
export function __wbg_recordplaintext_free(a: number): void;
export function recordplaintext_fromString(a: number, b: number, c: number): void;
export function recordplaintext_toString(a: number, b: number): void;
export function recordplaintext_microcredits(a: number): number;
export function recordplaintext_serialNumberString(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void;
export function __wbg_privatekeyciphertext_free(a: number): void;
export function privatekeyciphertext_encryptPrivateKey(a: number, b: number, c: number, d: number): void;
export function privatekeyciphertext_decryptToPrivateKey(a: number, b: number, c: number, d: number): void;
export function privatekeyciphertext_toString(a: number, b: number): void;
export function privatekeyciphertext_fromString(a: number, b: number, c: number): void;
export function __wbg_program_free(a: number): void;
export function program_fromString(a: number, b: number, c: number): void;
export function program_toString(a: number, b: number): void;
export function program_getFunctions(a: number): number;
export function program_getFunctionInputs(a: number, b: number, c: number, d: number): void;
export function program_getRecordMembers(a: number, b: number, c: number, d: number): void;
export function program_getStructMembers(a: number, b: number, c: number, d: number): void;
export function __wbg_recordciphertext_free(a: number): void;
export function recordciphertext_fromString(a: number, b: number, c: number): void;
export function recordciphertext_toString(a: number, b: number): void;
export function recordciphertext_decrypt(a: number, b: number, c: number): void;
export function recordciphertext_isOwner(a: number, b: number): number;
export function recordciphertext_get_nonce(a: number, b: number): void;
export function recordciphertext_point_scalar_mul(a: number, b: number, c: number, d: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
