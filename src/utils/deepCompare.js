// src/utils/deepCompare.js
export default function deepCompare(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
