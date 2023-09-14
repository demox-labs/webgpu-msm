import { ALEO_FIELD_MODULUS } from "../params/AleoConstants";

export interface gpuU32Inputs {
  u32Inputs: Uint32Array;
  individualInputSize: number;
}

export const bigIntsToU16Array = (beBigInts: bigint[]): Uint16Array => {
  const intsAs16s = beBigInts.map(bigInt => bigIntToU16Array(bigInt));
  const u16Array = new Uint16Array(beBigInts.length * 16);
  intsAs16s.forEach((intAs16, index) => {u16Array.set(intAs16, index * 16)});
  return u16Array;
}

export const bigIntToU16Array = (beBigInt: bigint): Uint16Array => {
  const numBits = 256;
  const bitsPerElement = 16;
  const numElements = numBits / bitsPerElement;
  const u16Array = new Uint16Array(numElements);
  const nonZeroBitString = beBigInt.toString(2);
  const paddedZeros = '0'.repeat(numBits - nonZeroBitString.length);
  const bitString = paddedZeros + nonZeroBitString;
  for (let i = 0; i < numElements; i++) {
    const startIndex = i * bitsPerElement;
    const endIndex = startIndex + bitsPerElement;
    const bitStringSlice = bitString.slice(startIndex, endIndex);
    const u16 = parseInt(bitStringSlice, 2);
    u16Array[i] = u16;
  }

  return u16Array;
};

// assume bigints are big endian 256-bit integers
export const bigIntsToU32Array = (beBigInts: bigint[]): Uint32Array => {
  const intsAs32s = beBigInts.map(bigInt => bigIntToU32Array(bigInt));
  const u32Array = new Uint32Array(beBigInts.length * 8);
  intsAs32s.forEach((intAs32, index) => {u32Array.set(intAs32, index * 8)});
  return u32Array;
};

// export const bigIntToU32Array = (beBigInt: bigint): Uint32Array => {
//   const numBits = 256;
//   const bitsPerElement = 32;
//   const numElements = numBits / bitsPerElement;
//   const u32Array = new Uint32Array(numElements);
//   const nonZeroBitString = beBigInt.toString(2);
//   const paddedZeros = '0'.repeat(numBits - nonZeroBitString.length);
//   const bitString = paddedZeros + nonZeroBitString;
//   for (let i = 0; i < numElements; i++) {
//     const startIndex = i * bitsPerElement;
//     const endIndex = startIndex + bitsPerElement;
//     const bitStringSlice = bitString.slice(startIndex, endIndex);
//     const u32 = parseInt(bitStringSlice, 2);
//     u32Array[i] = u32;
//   }

//   return u32Array;
// };

export const bigIntToU32Array = (beBigInt: bigint): Uint32Array => {
  const numBits = 256;
  const bitsPerElement = 32;
  const numElements = numBits / bitsPerElement;
  const u32Array = new Uint32Array(numElements);

  let tempBigInt = beBigInt;
  for (let i = numElements - 1; i >= 0; i--) {
    const mask = BigInt((1 << bitsPerElement) - 1); // Create a mask for the lower 32 bits
    u32Array[i] = Number(tempBigInt & mask); // Extract the lower 32 bits
    tempBigInt >>= BigInt(bitsPerElement); // Right-shift the remaining bits
  }

  return u32Array;
};


export const u32ArrayToBigInts = (u32Array: Uint32Array): bigint[] => {
  const bigInts = [];
  for (let i = 0; i < u32Array.length; i += 8) {
    const u32s = u32Array.slice(i, i + 8);
    let bigIntString = '';
    for (let j = 0; j < u32s.length; j++) {
      const u32 = u32s[j];
      const u32String = u32.toString(2);
      const paddedZeros = '0'.repeat(32 - u32String.length);
      bigIntString = bigIntString + paddedZeros + u32String;
    }
    const bigInt = BigInt('0b' + bigIntString);
    bigInts.push(bigInt);
  }
  return bigInts;
}

export const generateRandomFields = (inputSize: number): bigint[] => {
  const randomBigInts = [];
  for (let i = 0; i < inputSize; i++) {
    randomBigInts.push(createRandomAleoFieldInt());
  }

  return randomBigInts;
};

export const convertBigIntsToWasmFields = (bigInts: bigint[]): string[] => {
  return bigInts.map(bigInt => bigInt.toString() + 'field');
};

const createRandomAleoFieldInt = () => {
  let bigIntString = '';
  for (let i = 0; i < 8; i++) {
    bigIntString += Math.floor(Math.random() * (2**32 - 1));
  }
  return BigInt(bigIntString) % ALEO_FIELD_MODULUS;
}

export const stripFieldSuffix = (field: string): string => {
  return field.slice(0, field.length - 5);
};

export const stripGroupSuffix = (group: string): string => {
  return group.slice(0, group.length - 5);
};

export const chunkArray = (inputsArray: gpuU32Inputs[], batchSize: number): gpuU32Inputs[][] => {
  let index = 0;
  const chunkedArray: gpuU32Inputs[][] = [];
  const firstInputLength = inputsArray[0].u32Inputs.length / inputsArray[0].individualInputSize;

  while (index < firstInputLength) {
      const newIndex = index + batchSize;
      const tempArray: gpuU32Inputs[] = [];
      inputsArray.forEach(bufferData => {
        const chunkedGpuU32Inputs = bufferData.u32Inputs.slice(index * bufferData.individualInputSize, newIndex * bufferData.individualInputSize);
        tempArray.push({
          u32Inputs: chunkedGpuU32Inputs,
          individualInputSize: bufferData.individualInputSize
        });
      });
      index = newIndex;
      chunkedArray.push(tempArray);
  }

  return chunkedArray;
};