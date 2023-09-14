import React, { useEffect, useState } from 'react';
import { Benchmark } from './Benchmark';
import { bigIntToU32Array, generateRandomFields } from '../reference/webgpu/utils';
import { BigIntPoint, U32ArrayPoint } from '../reference/types';
import { webgpu_compute_msm, wasm_compute_msm, webgpu_pippenger_msm, webgpu_best_msm } from '../reference/reference';
import { compute_msm } from '../submission/submission';
import CSVExportButton from './CSVExportButton';
import { TestCaseDropDown } from './TestCaseDropDown';
import { TestCase } from '../test-data/testCases';

export const AllBenchmarks: React.FC = () => {
  const initialDefaultInputSize = 1_000;
  const [inputSize, setInputSize] = useState(initialDefaultInputSize);
  const [inputSizeDisabled, setInputSizeDisabled] = useState(false);
  const [baseAffineBigIntPoints, setBaseAffineBigIntPoints] = useState<BigIntPoint[]>([]);
  const [bigIntScalars, setBigIntScalars] = useState<bigint[]>([]);
  const [u32Points, setU32Points] = useState<U32ArrayPoint[]>([]);
  const [u32Scalars, setU32Scalars] = useState<Uint32Array[]>([]);
  const [expectedResult, setExpectedResult] = useState<{x: bigint, y: bigint} | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [benchmarkResults, setBenchmarkResults] = useState<any[][]>([["InputSize", "MSM Func", "Time (MS)"]]);
  const [comparisonResults, setComparisonResults] = useState<{ x: bigint, y: bigint, timeMS: number, msmFunc: string, inputSize: number }[]>([]);

  const postResult = (result: {x: bigint, y: bigint}, timeMS: number, msmFunc: string) => {
    const benchMarkResult = [inputSize, msmFunc, timeMS];
    setBenchmarkResults([...benchmarkResults, benchMarkResult]);
    setComparisonResults([...comparisonResults, {x: result.x, y: result.y, timeMS, msmFunc, inputSize}]);
    if (msmFunc === 'Aleo Wasm') {
      setExpectedResult(result);
    }
  };

  const setTestCaseData = async (testCase: TestCase) => {
    setInputSizeDisabled(true);
    setBaseAffineBigIntPoints(testCase.baseAffinePoints);
    const newU32Points = testCase.baseAffinePoints.map((point) => {
      return {
        x: bigIntToU32Array(point.x),
        y: bigIntToU32Array(point.y),
        t: bigIntToU32Array(point.t),
        z: bigIntToU32Array(point.z),
      }});
    setU32Points(newU32Points);
    setBigIntScalars(testCase.scalars);
    const newU32Scalars = testCase.scalars.map((scalar) => bigIntToU32Array(scalar));
    setU32Scalars(newU32Scalars);
    setExpectedResult(testCase.expectedResult);
  };

  const useRandomInputs = () => {
    setInputSizeDisabled(false);
    setInputSize(initialDefaultInputSize);
  };

  useEffect(() => {
    async function generateNewInputs() {
      // creating random points is slow, so for now use a single fixed base.
      // const newPoints = await createRandomAffinePoints(inputSize);
      const x = BigInt('2796670805570508460920584878396618987767121022598342527208237783066948667246');
      const y = BigInt('8134280397689638111748378379571739274369602049665521098046934931245960532166');
      const t = BigInt('3446088593515175914550487355059397868296219355049460558182099906777968652023');
      const z = BigInt('1');
      const point: BigIntPoint = {x, y, t, z};
      const newPoints = Array(inputSize).fill(point);
      setBaseAffineBigIntPoints(newPoints);
      const newU32Points = newPoints.map((point) => {
        return {
          x: bigIntToU32Array(point.x),
          y: bigIntToU32Array(point.y),
          t: bigIntToU32Array(point.t),
          z: bigIntToU32Array(point.z),
        }});
      setU32Points(newU32Points);

      const newScalars = generateRandomFields(inputSize);
      setBigIntScalars(newScalars);
      const newU32Scalars = newScalars.map((scalar) => bigIntToU32Array(scalar));
      setU32Scalars(newU32Scalars);
    }
    generateNewInputs();
    setComparisonResults([]);
  }, [inputSize]);
  
  return (
    <div>
      <div className="flex items-center space-x-4 px-5">
        <div className="text-gray-800">Input Size:</div>
        <input
          type="text"
          className="w-24 border border-gray-300 rounded-md px-2 py-1"
          value={inputSize}
          disabled={inputSizeDisabled}
          onChange={(e) => setInputSize(parseInt(e.target.value))}
        />
        <TestCaseDropDown useRandomInputs={useRandomInputs} setTestCaseData={setTestCaseData}/>
        <CSVExportButton data={benchmarkResults} filename={'msm-benchmark'} />
      </div>
      
      <Benchmark
        name={'Pippenger WebGPU MSM'}
        baseAffinePoints={baseAffineBigIntPoints}
        scalars={bigIntScalars}
        expectedResult={expectedResult}
        msmFunc={webgpu_pippenger_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Naive WebGPU MSM'}
        // baseAffinePoints={u32Points}
        // scalars={u32Scalars}
        baseAffinePoints={baseAffineBigIntPoints}
        scalars={bigIntScalars}
        expectedResult={expectedResult}
        msmFunc={webgpu_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Aleo Wasm'}
        baseAffinePoints={baseAffineBigIntPoints}
        scalars={bigIntScalars}
        expectedResult={expectedResult}
        msmFunc={wasm_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Our Best WebGPU MSM'}
        baseAffinePoints={baseAffineBigIntPoints}
        scalars={bigIntScalars}
        expectedResult={expectedResult}
        msmFunc={webgpu_best_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Your MSM'}
        baseAffinePoints={baseAffineBigIntPoints}
        scalars={bigIntScalars}
        expectedResult={expectedResult}
        msmFunc={compute_msm}
        postResult={postResult}
      />
    </div>
  )
};