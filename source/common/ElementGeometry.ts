/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2017 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { Base64 } from "js-base64";
import { Constant } from "@bentley/geometry-core/lib/Constant";
import { Angle } from "@bentley/geometry-core/lib/Geometry";
import { Point3d, Vector3d, Range3d, YawPitchRollAngles, Point2d, Range2d, Transform, RotMatrix } from "@bentley/geometry-core/lib/PointVector";

/**
 * A Range3d that is aligned with the axes of a coordinate space.
 */
export class AxisAlignedBox3d extends Range3d {
  constructor(low?: Point3d, high?: Point3d) {
    if (low === undefined || high === undefined)
      super(); // defines an empty box
    else
      super(low.x, low.y, low.z, high.x, high.y, high.z);
  }
  public static fromRange2d(r: Range2d) {const v = new AxisAlignedBox3d(); v.low.x = r.low.x; v.low.y = r.low.y; v.high.x = r.high.x; v.high.y = r.high.y; return v; }
  public getCenter(): Point3d { return this.low.interpolate(.5, this.high); }
}

/** A bounding box aligned to the orientation of a 3d Element */
export class ElementAlignedBox3d extends Range3d {
  public constructor(low?: Point3d, high?: Point3d) {
    if (low === undefined || high === undefined)
      super(); // defines an empty box
    else
      super(low.x, low.y, low.z, high.x, high.y, high.z);
  }
  public get left() { return this.low.x; }
  public get bottom() { return this.low.y; }
  public get front() { return this.low.z; }
  public get right() { return this.high.x; }
  public get top() { return this.high.y; }
  public get back() { return this.high.z; }
  public get width() { return this.xLength(); }
  public get depth() { return this.yLength(); }
  public get height() { return this.zLength(); }
  public get volume() { return this.width * this.height * this.depth; }
  public isValid(): boolean {
    const max = Constant.circumferenceOfEarth; const lo = this.low; const hi = this.high;
    return !this.isNull() && lo.x > -max && lo.y > -max && lo.z > -max && hi.x < max && hi.y < max && hi.z < max;
  }
  public static fromJSON(json?: any): ElementAlignedBox3d {
    if (!json)
      return new ElementAlignedBox3d();
    return new ElementAlignedBox3d(Point3d.fromJSON(json.low), Point3d.fromJSON(json.high));
  }
}

/** A bounding box aligned to the orientation of a 2d Element */
export class ElementAlignedBox2d extends Range2d {
  public constructor(low?: Point2d, high?: Point2d) {
    if (!low || !high)
      super(); // defines an empty box
    else
      super(low.x, low.y, high.x, high.y);
  }
  public get left() { return this.low.x; }
  public get bottom() { return this.low.y; }
  public get right() { return this.high.x; }
  public get top() { return this.high.y; }
  public get width() { return this.xLength(); }
  public get height() { return this.yLength(); }
  public get area() { return this.width * this.height; }
  public static fromJSON(json?: any): ElementAlignedBox2d {
    if (!json)
      return new ElementAlignedBox2d();
    return new ElementAlignedBox2d(Point2d.fromJSON(json.low), Point2d.fromJSON(json.high));
  }
  public isValid(): boolean {
    const max = Constant.circumferenceOfEarth; const lo = this.low; const hi = this.high;
    return !this.isNull() && lo.x > -max && lo.y > -max && hi.x < max && hi.y < max;
  }
}

export class GeometryStream {
  public geomStream: ArrayBuffer;
  public constructor(stream: any) { this.geomStream = stream; }
  public toJSON(): string { return Base64.encode(this.geomStream as any); }

  /** return false if this GeometryStream is empty. */
  public hasGeometry(): boolean { return this.geomStream.byteLength !== 0; }
  public static fromJSON(json?: any): GeometryStream | undefined {
    return json ? new GeometryStream(json instanceof GeometryStream ? json.geomStream : Base64.decode(json)) : undefined;
  }
}

/**
 * The placement of a GeometricElement3d. This includes the origin, orientation, and size (bounding box) of the element.
 * All geometry of a GeometricElement are relative to its placement.
 */
export class Placement3d {
  public constructor(public origin: Point3d, public angles: YawPitchRollAngles, public bbox: ElementAlignedBox3d) { }
  public getTransform() { return Transform.createOriginAndMatrix(this.origin, this.angles.toRotMatrix()); }
  public static fromJSON(json?: any): Placement3d {
    json = json ? json : {};
    return new Placement3d(Point3d.fromJSON(json.origin), YawPitchRollAngles.fromJSON(json.angles), ElementAlignedBox3d.fromJSON(json.bbox));
  }

  /** Determine whether this Placement3d is valid. */
  public isValid(): boolean { return this.bbox.isValid() && this.origin.maxAbs() < Constant.circumferenceOfEarth; }
}

/** The placement of a GeometricElement2d. This includes the origin, rotation, and size (bounding box) of the element. */
export class Placement2d {
  public constructor(public origin: Point2d, public angle: Angle, public bbox: ElementAlignedBox2d) { }
  public getTransform() { return Transform.createOriginAndMatrix(Point3d.createFrom(this.origin), RotMatrix.createRotationAroundVector(Vector3d.unitZ(), this.angle)!); }
  public static fromJSON(json?: any): Placement2d {
    json = json ? json : {};
    return new Placement2d(Point2d.fromJSON(json.origin), Angle.fromJSON(json.angle), ElementAlignedBox2d.fromJSON(json.bbox));
  }

  /** Determine whether this Placement2d is valid. */
  public isValid(): boolean { return this.bbox.isValid() && this.origin.maxAbs() < Constant.circumferenceOfEarth; }
}
