import React from 'react';
import { Benchmark } from './Benchmark';
import { point_mul } from '../webgpu/entries/curveMulPointEntry';
import { point_mul_multi } from '../webgpu/entries/curveMulPointMultiPassEntry';
import { FieldMath } from '../utils/FieldMath';
import { naive_msm } from '../webgpu/entries/naiveMSMEntry';
import { bulkGroupScalarMul, msm } from '../utils/wasmFunctions';
import { bigIntsToU32Array, stripGroupSuffix } from '../webgpu/utils';

const pointScalarGenerator = (inputSize: number): bigint[][] => {
  const groupArr = new Array(inputSize);
  const scalarArr = new Array(inputSize);
  scalarArr.fill(BigInt('303411688971426691737907573487068071512981595762917890905859781721748416598'));
  // known group
  groupArr.fill(BigInt('2796670805570508460920584878396618987767121022598342527208237783066948667246'));
  // const scalarArr = generateRandomFields(inputSize);
  return [groupArr, scalarArr];
};

// const randomPointScalarGenerator = (inputSize: number): bigint[][] => {
//   return [generateRandomPointXs(inputSize), generateRandomFields(inputSize)];
// }

const gpuPointScalarInputConverter = (inputs: bigint[][]): number[][] => {
  const x_coords = inputs[0];
  const fieldMath = new FieldMath();
  const y_coords_map = new Map<bigint, bigint>();
  const y_coords = x_coords.map((x) => {
    const known_y = y_coords_map.get(x);
    const y = known_y ?? fieldMath.getPointFromX(x).y;
    y_coords_map.set(x, y);
    return y;
  });
  const point_inputs = x_coords.map((x, i) => [x, y_coords[i]]).flat();

  return [Array.from(bigIntsToU32Array(point_inputs)), Array.from(bigIntsToU32Array(inputs[1]))];
};

const wasmPointMulConverter = (inputs: bigint[][]): string[][] => {
  const groups = inputs[0].map((input) => `${input}group`);
  const scalars = inputs[1].map((input) => `${input}scalar`);
  return [groups, scalars];
};

export const AllBenchmarks: React.FC = () => {
  return (
    <div>
      <Benchmark
        name={'Point Scalar Mul'}
        inputsGenerator={pointScalarGenerator}
        gpuFunc={(inputs: number[][]) => point_mul(inputs[0], inputs[1])}
        gpuInputConverter={gpuPointScalarInputConverter}
        wasmFunc={(inputs: string[][]) => bulkGroupScalarMul(inputs[0], inputs[1])}
        wasmInputConverter={wasmPointMulConverter}
        wasmResultConverter={(results: string[]) => { return results.map((result) => stripGroupSuffix(result))}}
      />
      <Benchmark
        name={'Point Scalar Mul multi pass'}
        inputsGenerator={pointScalarGenerator}
        gpuFunc={(inputs: number[][]) => point_mul_multi(inputs[0], inputs[1])}
        gpuInputConverter={gpuPointScalarInputConverter}
        wasmFunc={(inputs: string[][]) => bulkGroupScalarMul(inputs[0], inputs[1])}
        wasmInputConverter={wasmPointMulConverter}
        wasmResultConverter={(results: string[]) => { return results.map((result) => stripGroupSuffix(result))}}
      />
      <Benchmark
        name={'Naive GPU MSM'}
        inputsGenerator={pointScalarGenerator}
        // change to custom summation function using FieldMath.addPoints
        gpuFunc={(inputs: number[][]) => naive_msm(inputs[0], inputs[1])}
        gpuInputConverter={gpuPointScalarInputConverter}
        wasmFunc={(inputs: string[][]) => msm(inputs[0], inputs[1])}
        wasmInputConverter={wasmPointMulConverter}
        wasmResultConverter={(results: string[]) => { return results.map((result) => stripGroupSuffix(result))}}
      />
    </div>
  )
};