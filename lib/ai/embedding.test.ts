import { describe, expect, test, jest } from '@jest/globals';
import { generateChunks } from './embedding';

// Mock the dependencies
jest.mock('nanoid', () => ({
  customAlphabet: () => () => 'test-id'
}));

jest.mock('clsx', () => ({
  clsx: () => ''
}));

jest.mock('tailwind-merge', () => ({
  twMerge: () => ''
}));

jest.mock('@/lib/db', () => ({}));
jest.mock('@/lib/env.mjs', () => ({}));
jest.mock('ai', () => ({}));

describe('Text Chunking', () => {
  test('should split Chinese text into sentences correctly', () => {
    const input = '高祖，沛丰邑中阳里人，姓刘氏，字季。父曰太公，母曰刘媪。其先刘媪尝息大泽之陂，梦与神遇。是时雷电晦冥，太公往视，则见蛟龙於其上。已而有身，遂产高祖。';
    const expected = [
      '高祖，沛丰邑中阳里人，姓刘氏，字季',
      '父曰太公，母曰刘媪',
      '其先刘媪尝息大泽之陂，梦与神遇',
      '是时雷电晦冥，太公往视，则见蛟龙於其上',
      '已而有身，遂产高祖'
    ];
    
    const result = generateChunks(input);
    expect(result).toEqual(expected);
  });

  test('should handle mixed Chinese and English punctuation', () => {
    const input = '这是第一句。This is the second sentence! 这是第三句？';
    const expected = [
      '这是第一句',
      'This is the second sentence',
      '这是第三句'
    ];
    
    const result = generateChunks(input);
    expect(result).toEqual(expected);
  });

  test('should handle empty input', () => {
    const input = '';
    const expected: string[] = [];
    
    const result = generateChunks(input);
    expect(result).toEqual(expected);
  });

  test('should handle input with only whitespace', () => {
    const input = '   \n  \t  ';
    const expected: string[] = [];
    
    const result = generateChunks(input);
    expect(result).toEqual(expected);
  });

  test('should trim whitespace from chunks', () => {
    const input = '  第一句。  第二句  。  第三句  ';
    const expected = ['第一句', '第二句', '第三句'];
    
    const result = generateChunks(input);
    expect(result).toEqual(expected);
  });
}); 