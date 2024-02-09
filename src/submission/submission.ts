import { BigIntPoint, U32ArrayPoint } from "../reference/types";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const compute_msm = async (
  baseAffinePoints: BigIntPoint[] | U32ArrayPoint[] | Buffer,
  scalars: bigint[] | Uint32Array[] | Buffer
  ): Promise<{x: bigint, y: bigint}> => {
  throw new Error("Not implemented");
};