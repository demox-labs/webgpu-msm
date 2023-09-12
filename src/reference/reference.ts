import { Point } from "./types";
import { FieldMath } from "./utils/FieldMath";
import { loadWasmModule } from "./wasm-loader/wasm-loader";
import { naive_msm } from "./webgpu/entries/naiveMSMEntry";
import { bigIntsToU32Array, bigIntsToU16Array } from "./webgpu/utils";
import { pippinger_msm } from "./webgpu/entries/pippengerMSMEntry";

export const webgpu_pippenger_msm = async (
  baseAffinePoints: Point[],
  scalars: bigint[]
) => {
  const point = {
    x: BigInt('2796670805570508460920584878396618987767121022598342527208237783066948667246'),
    y: BigInt('8134280397689638111748378379571739274369602049665521098046934931245960532166'),
    t: BigInt('3446088593515175914550487355059397868296219355049460558182099906777968652023'),
    z: BigInt('1')
  }
  const tempArray = new Array(baseAffinePoints.length);
  tempArray.fill(point);
  baseAffinePoints = tempArray;
  console.log('baseAffinePoints', baseAffinePoints);
  console.log('scalars', scalars);
  const fieldMath = new FieldMath();
  const pointsAsU32s = baseAffinePoints.map(point => fieldMath.createPoint(point.x, point.y, point.t, point.z));
  const scalarsAsU16s = Array.from(bigIntsToU16Array(scalars));
  return await pippinger_msm(pointsAsU32s, scalarsAsU16s, fieldMath);
}

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