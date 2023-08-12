import React, { useEffect, useState } from 'react';
import { Benchmark } from './Benchmark';
import { generateRandomFields } from '../reference/webgpu/utils';
import { Point } from '../reference/types';
import { webgpu_compute_msm, wasm_compute_msm } from '../reference/reference';
import { compute_msm } from '../submission/submission';
import CSVExportButton from './CSVExportButton';

const constPointGenerator = (inputSize: number): Point[] => {
  const pointArr = new Array(inputSize);
  const constPoint: Point = {
    x: BigInt('2796670805570508460920584878396618987767121022598342527208237783066948667246'),
    y: BigInt('8134280397689638111748378379571739274369602049665521098046934931245960532166'),
    t: BigInt('3446088593515175914550487355059397868296219355049460558182099906777968652023'),
    z: BigInt('1')
  };
  pointArr.fill(constPoint);
  return pointArr;
};

// const randomPointScalarGenerator = (inputSize: number): bigint[][] => {
//   return [generateRandomPointXs(inputSize), generateRandomFields(inputSize)];
// }

export const AllBenchmarks: React.FC = () => {
  const initialDefaultInputSize = 1_000;
  const [inputSize, setInputSize] = useState(initialDefaultInputSize);
  const [baseAffinePoints, setBaseAffinePoints] = useState<Point[]>([]);
  const [scalars, setScalars] = useState<bigint[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [benchmarkResults, setBenchmarkResults] = useState<any[][]>([["InputSize", "MSM Func", "Time (MS)"]]);
  const [comparisonResults, setComparisonResults] = useState<{ x: bigint, y: bigint, timeMS: number, msmFunc: string, inputSize: number }[]>([]);

  const postResult = (result: {x: bigint, y: bigint}, timeMS: number, msmFunc: string) => {
    const benchMarkResult = [inputSize, msmFunc, timeMS];
    setBenchmarkResults([...benchmarkResults, benchMarkResult]);
    setComparisonResults([...comparisonResults, {x: result.x, y: result.y, timeMS, msmFunc, inputSize}]);
  };

  useEffect(() => {
    const newPoints = constPointGenerator(inputSize);
    setBaseAffinePoints(newPoints);
    const newScalars = generateRandomFields(inputSize);
    setScalars(newScalars);
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
          onChange={(e) => setInputSize(parseInt(e.target.value))}
        />
        <CSVExportButton data={benchmarkResults} filename={'msm-benchmark'} />
      </div>
      
      <Benchmark
        name={'Naive WebGPU MSM'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        msmFunc={webgpu_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Aleo Wasm'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        msmFunc={wasm_compute_msm}
        postResult={postResult}
      />
      <Benchmark
        name={'Your MSM'}
        baseAffinePoints={baseAffinePoints}
        scalars={scalars}
        msmFunc={compute_msm}
        postResult={postResult}
      />
    </div>
  )
};