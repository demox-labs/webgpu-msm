import React, { useEffect, useState } from 'react';
import { Benchmark } from './Benchmark';
import { generateRandomFields } from '../reference/webgpu/utils';
import { Point } from '../reference/types';
import { webgpu_compute_msm, wasm_compute_msm } from '../reference/reference';
import { compute_msm } from '../submission/submission';
import CSVExportButton from './CSVExportButton';
import { TestCaseDropDown } from './TestCaseDropDown';
import { TestCase } from '../test-data/testCases';

export const AllBenchmarks: React.FC = () => {
  const initialDefaultInputSize = 1_000;
  const [inputSize, setInputSize] = useState(initialDefaultInputSize);
  const [inputSizeDisabled, setInputSizeDisabled] = useState(false);
  const [baseAffinePoints, setBaseAffinePoints] = useState<Point[]>([]);
  const [scalars, setScalars] = useState<bigint[]>([]);
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
    setBaseAffinePoints(testCase.baseAffinePoints);
    setScalars(testCase.scalars);
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
      const point: Point = {x, y, t, z};
      const newPoints = Array(inputSize).fill(point);
      setBaseAffinePoints(newPoints);

      const newScalars = generateRandomFields(inputSize);
      setScalars(newScalars);
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
        name={'Naive WebGPU MSM'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        expectedResult={expectedResult}
        msmFunc={webgpu_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Aleo Wasm'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        expectedResult={expectedResult}
        msmFunc={wasm_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Your MSM'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        expectedResult={expectedResult}
        msmFunc={compute_msm}
        postResult={postResult}
      />
    </div>
  )
};