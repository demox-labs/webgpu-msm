import { generateAndSaveAffinePoints } from "../test-data/createRandomAffinePoints";
import { BigIntPoint, U32ArrayPoint } from "./types";
import { FieldMath } from "./utils/FieldMath";
import { wasmMSM } from "./workers/wasmMSM";
import * as Aleo from "@demox-labs/gpu-wasm-expose";

export const wasm_compute_msm = async (
  baseAffinePoints: BigIntPoint[] | U32ArrayPoint[],
  scalars: bigint[] | Uint32Array[]
  ): Promise<{x: bigint, y: bigint}> => {
  const groups = (baseAffinePoints as BigIntPoint[]).map(point => point.x.toString() + 'group');
  const aleoScalars = (scalars as bigint[]).map(scalar => scalar.toString() + 'scalar');
  const xresult = Aleo.Address.msm(groups, aleoScalars);
  const xNum = xresult.slice(0, xresult.indexOf('group'));
  return new FieldMath().getPointFromX(BigInt(xNum));
};

export const wasm_compute_bls12_377_msm = async (
  baseAffinePoints: BigIntPoint[] | U32ArrayPoint[],
  scalars: bigint[] | Uint32Array[]
  ): Promise<{x: bigint, y: bigint}> => {
    // baseAffinePoints = [{
    //   x: BigInt('170606571394932666197190153878127905435078385265361551843475762214522058106559894007366934201296194067095914989945'),
    //   y: BigInt('181120576247684251030349027056848121863660770917769237392628175835890306018626774951141036592662472604526096249673'),
    //   z: 1n },
    // { 
    //   x: BigInt('230156421360042004505386433898882249319947843026606682792613345485093483184009533446968273196543869922373697965149'),
    //   y: BigInt('54045380935705035503003534840553356531604334465320318319395427610017177331076286608240935438326143307410202945633'),
    //   z: 1n },
    //   { 
    //     x: BigInt('35398885163306581161737536966958018735228047975008405949305669351541349455264958765288105737724079008776843550946'),
    //     y: BigInt('148474730539319056506655339760734895240108263266134464134919484447641550037397528792305938323087309076987426687872'),
    //     z: 1n }
    // ];
    // const testScalars = [
    //   '7235690852973146819184880776600168476307297958995304924983681368733140370878',
    //   '1085150059164823749731331070370144584472217304588454729105180916141380130525',
    //   '4219457211581752292241887891960685447703087891130900913808530787520181577122',
    // ];
    const aleoXs = baseAffinePoints.map(point => point.x.toString());
    const aleoYs = baseAffinePoints.map(point => point.y.toString());
    const affineResult = Aleo.Address.bls12_377_msm(aleoXs, aleoYs, scalars.map(scalar => scalar.toString()));
    // affineResult will be in the form Affine(x=..., y=...), so need to parse
    const xresult = affineResult.slice(affineResult.indexOf('x=') + 2, affineResult.indexOf(', y='));
    const yresult = affineResult.slice(affineResult.indexOf('y=') + 2, affineResult.indexOf(')'));
    return { x: BigInt(xresult), y: BigInt(yresult) };
};

export const wasm_compute_msm_parallel = async (
  baseAffinePoints: BigIntPoint[] | U32ArrayPoint[],
  scalars: bigint[] | Uint32Array[]
  ): Promise<{x: bigint, y: bigint}> => {
  const groups = (baseAffinePoints as BigIntPoint[]).map(point => point.x.toString() + 'group');
  const aleoScalars = (scalars as bigint[]).map(scalar => scalar.toString() + 'scalar');
  const xNum = await wasmMSM(groups, aleoScalars);
  return new FieldMath().getPointFromX(BigInt(xNum));
};
