import { Point } from "./types";
import { FieldMath } from "./utils/FieldMath";
import { loadWasmModule } from "./wasm-loader/wasm-loader";
import { naive_msm } from "./webgpu/entries/naiveMSMEntry";
import { bigIntsToU32Array } from "./webgpu/utils";

export const webgpu_compute_msm = async (
  baseAffinePoints: Point[],
  scalars: bigint[]
  ): Promise<{x: bigint, y: bigint}> => {
  const flattenedPoints = baseAffinePoints.flatMap(point => [point.x, point.y]);
  const pointsAsU32s = Array.from(bigIntsToU32Array(flattenedPoints));
  const scalarsAsU32s = Array.from(bigIntsToU32Array(scalars));
  return await naive_msm(pointsAsU32s, scalarsAsU32s);
};

export const wasm_compute_msm = async (
  baseAffinePoints: Point[],
  scalars: bigint[]
  ): Promise<{x: bigint, y: bigint}> => {
  const aleo = await loadWasmModule();
  const groups = baseAffinePoints.map(point => point.x.toString() + 'group');
  const aleoScalars = scalars.map(scalar => scalar.toString() + 'scalar');
  const xresult = await aleo.Address.msm(groups, aleoScalars);
  const xNum = xresult.slice(0, xresult.indexOf('group'));
  return new FieldMath().getPointFromX(BigInt(xNum));
};