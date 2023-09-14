import { BigIntPoint, U32ArrayPoint } from "../reference/types";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const compute_msm = async (
  baseAffinePoints: BigIntPoint[] | U32ArrayPoint[],
  scalars: bigint[] | Uint32Array[]
  ): Promise<{x: bigint, y: bigint}> => {
  throw new Error("Not implemented");
};