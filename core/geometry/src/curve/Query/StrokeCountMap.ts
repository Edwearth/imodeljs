/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { CurvePrimitive } from "../CurvePrimitive";
/** @module Curve */
/**
 * data carrier interface for per-primitive stroke counts and distances used by PolyfaceBuilder.
 * * For a simple primitive (Line segment or arc) that is stroked with uniform fraction, the members are:
 *   * `numStroke` = total number of strokes
 *   * `curveLength` = length of this curve
 *   * `a0` = external mapped coordinate for fraction 0 on this primitive or component
 *   * `a1` = external mapped coordinate for fraction 1 on this primitive or component
 *
 * * For linestring and bspline curve, those numbers are totals for the overall curve, and breakdown within
 *     the components (line segments or bezier spans) is recoreded on the optional array `componentData[]`
 *   * Members of the array are annotated with componentIndex within the linestring or bspline curve
 */
export class StrokeCountMap {

  public numStroke: number;
  public curveLength: number;
  public a0: number;
  public a1: number;
  public componentData?: StrokeCountMap[];
  public primitive?: CurvePrimitive;
  public componentIndex?: number;
  /**
   * Constructor.  Initialize all fields from arguments.
   * * Callers that expect to announce numStroke and curveLength for multiple components send an empty componentData array.
   * * Callers that do not have multiple components send undefined component data.
   * @param numStroke
   * @param curveLength
   * @param a0
   * @param a1
   * @param componentData
   */
  private constructor(numStroke: number, curveLength: number, a0: number, a1: number, componentData?: StrokeCountMap[]) {
    this.numStroke = numStroke;
    this.curveLength = curveLength;
    this.a0 = a0;
    this.a1 = a1;
    this.componentData = componentData;
  }
  /**
   * Create a `StrokeCountMap` with curve primitive and optional compontnData array.
   * @param primitive
   * @param numStroke
   * @param curveLength
   * @param a0
   * @param a1
   * @param componentData
   */
  public static createWithCurvePrimitive(primitive: CurvePrimitive, numStroke: number, curveLength: number, a0: number, a1: number, componentData?: StrokeCountMap[]) {
    const result = new StrokeCountMap(numStroke, curveLength, a0, a1, componentData);
    result.primitive = primitive;
    return result;
  }
  /**
   * Create a `StrokeCountMap` with `componentIndex` (but no primitive or componentData array)
   * @param index
   * @param numStroke
   * @param curveLength
   * @param a0
   * @param a1
   */
  public static createWithComponentIndex(componentIndex: number, numStroke: number, curveLength: number, a0: number, a1: number) {
    const result = new StrokeCountMap(numStroke, curveLength, a0, a1);
    result.componentIndex = componentIndex;
    return result;
  }

  /**
   * create a StrokeCountMap, optionally
   * * (a) use parent a1 as new a0
   * * (b) attach a (usually empty) array for component counts.
   * @param parentMap optional map whose a1 becomes a0 in the new map.
   * @param componentData optional array of component StrokeCountMaps.
   */
  public static createWithCurvePrimitiveAndOptionalParent(curvePrimitive: CurvePrimitive, parentMap?: StrokeCountMap, componentData?: StrokeCountMap[]): StrokeCountMap {
    const a0 = parentMap ? parentMap.a1 : 0.0;
    const result = new StrokeCountMap(0, 0, a0, a0, componentData);
    result.primitive = curvePrimitive;
    return result;

  }
  /**
   * Apply stroke count and curve length from a component to a parent map.
   * If componentData is present, install the new count and length with distance limits
   * @param parentMap map to be updated.
   * @param numStroke number of strokes on new child curve
   * @param curveLength curve length for new child curve.
   */
  public addToCountAndLength(numStroke: number, curveLength: number) {
    const a2 = this.a1 + curveLength;
    if (this.componentData) {
      this.componentData.push(
        new StrokeCountMap(numStroke, curveLength, this.a1, a2));
    }
    this.numStroke += numStroke;
    this.curveLength += curveLength;
    this.a1 = a2;
  }
  /** return true if `other` has the same component structure as `this`
   * * testing recursives through corresponding members of cmomponentData arrays.
   */
  public isCompatibleComponentStructure(other: StrokeCountMap, enforceCounts: boolean): boolean {
    if (enforceCounts && this.numStroke !== other.numStroke)
      return false;
    if (this.componentData === undefined && other.componentData === undefined)
      return true;
    if (this.componentData && other.componentData) {
      // both have components. Recurse . . ..
      if (this.componentData.length !== other.componentData.length)
        return false;
      const n = this.componentData.length;
      for (let i = 0; i < n; i++)
        if (!this.componentData[i].isCompatibleComponentStructure(other.componentData[i], enforceCounts))
          return false;
      return true;
    }
    // one has componentData, the other not.
    return false;
  }
}
