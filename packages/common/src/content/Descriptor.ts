/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2017 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
/** @module Content */

import * as ec from "../EC";
import { Field, FieldJSON } from "./Fields";

/**
 * Data structure that describes an ECClass in content [[Descriptor]].
 */
export interface SelectClassInfo {
  /** Information about the ECClass */
  selectClassInfo: Readonly<ec.ClassInfo>;
  /** Is the class handled polymorphically */
  isSelectPolymorphic: boolean;
  /** Relationship path to the [Primary class]($docs/learning/content/Terminology#primary-class) */
  pathToPrimaryClass: Readonly<ec.RelationshipPathInfo>;
  /** Relationship paths to [Related property]($docs/learning/content/Terminology#related-properties) classes */
  relatedPropertyPaths: Array<Readonly<ec.RelationshipPathInfo>>;
}

/**
 * Flags that control content format.
 */
export enum ContentFlags {
  /** Each content record only has [[InstanceKey]] and no data */
  KeysOnly = 1 << 0,

  /** Each content record additionally has an image id */
  ShowImages = 1 << 1,

  /** Each content record additionally has a display label */
  ShowLabels = 1 << 2,

  /** All content records are merged into a single record (see [Merging values]($docs/learning/content/Terminology#value-merging)) */
  MergeResults = 1 << 3,

  /** Content has only distinct values */
  DistinctValues = 1 << 4,

  /** Doesn't create property or calculated fields. Can be used in conjunction with [[ShowLabels]]. */
  NoFields = 1 << 5,
}

/**
 * Data sorting direction
 */
export enum SortDirection {
  Ascending,
  Descending,
}

/**
 * Data structure that contains selection information. Used
 * for cases when requesting content after a selection change.
 */
export interface SelectionInfo {
  providerName: string;
  level?: number;
}

/**
 * Serialized [[Descriptor]] JSON representation.
 */
export interface DescriptorJSON {
  connectionId: string;
  inputKeysHash: string;
  contentOptions: any;
  selectionInfo?: SelectionInfo;
  displayType: string;
  selectClasses: SelectClassInfo[];
  fields: FieldJSON[];
  sortingFieldName?: string;
  sortDirection?: SortDirection;
  contentFlags: number;
  filterExpression?: string;
}

/** @hidden */
export interface DescriptorOverrides {
  displayType: string;
  hiddenFieldNames: string[];
  contentFlags: number;
  sortingFieldName?: string;
  sortDirection?: SortDirection;
  filterExpression?: string;
}

/**
 * Data structure that describes content: fields, sorting, filtering, format, etc.
 * Descriptor may be changed to control how content is created.
 */
export default class Descriptor {
  /** Id of the connection used to create the descriptor */
  public readonly connectionId!: string;
  /** Hash of the input keys used to create the descriptor */
  public readonly inputKeysHash!: string;
  /** Extended options used to create the descriptor */
  public readonly contentOptions: any;
  /** Selection info used to create the descriptor */
  public readonly selectionInfo?: SelectionInfo;
  /** Display type used to create the descriptor */
  public readonly displayType!: string;
  /** A list of classes that will be selected from when creating content with this descriptor */
  public readonly selectClasses!: SelectClassInfo[];
  /** A list of fields contained in the descriptor */
  public readonly fields!: Field[];
  /** [[ContentFlags]] used to create the descriptor */
  public contentFlags!: number;
  /** Field used to sort the content */
  public sortingField?: Field;
  /** Sorting direction */
  public sortDirection?: SortDirection;
  /** Content filtering [ECExpression]($docs/learning/ECExpressions) */
  public filterExpression?: string;

  /* istanbul ignore next */
  private constructor() {}

  /*public toJSON(): DescriptorJSON {
    return Object.assign({}, this, {
      fields: this.fields.map((field: Field) => field.toJSON()),
    });
  }*/

  /**
   * Deserialize Descriptor from JSON
   * @param json JSON or JSON serialized to string to deserialize from
   * @returns Deserialized descriptor or undefined if deserialization failed
   */
  public static fromJSON(json: DescriptorJSON | string | undefined): Descriptor | undefined {
    if (!json)
      return undefined;
    if (typeof json === "string")
      return JSON.parse(json, Descriptor.reviver);
    const descriptor = Object.create(Descriptor.prototype);
    return Object.assign(descriptor, json, {
      fields: json.fields.map((fieldJson: FieldJSON) => Field.fromJSON(fieldJson)),
    });
  }

  /**
   * Reviver function that can be used as a second argument for
   * `JSON.parse` method when parsing Content objects.
   */
  public static reviver(key: string, value: any): any {
    return key === "" ? Descriptor.fromJSON(value) : value;
  }

  /** @hidden */
  public createDescriptorOverrides(): DescriptorOverrides {
    return {
      displayType: this.displayType,
      hiddenFieldNames: [],
      sortingFieldName: this.sortingField ? this.sortingField.name : undefined,
      sortDirection: this.sortDirection,
      contentFlags: this.contentFlags,
      filterExpression: this.filterExpression,
    };
  }

  /** @hidden */
  public resetParentship(): void {
    for (const field of this.fields)
      field.resetParentship();
  }

  /** @hidden */
  public rebuildParentship(): void {
    for (const field of this.fields)
      field.rebuildParentship();
  }

  /** @hidden */
  public createStrippedDescriptor(): Descriptor {
    const stripped = Object.create(Descriptor.prototype);
    return Object.assign(stripped, this, {
      fields: [],
      selectClasses: [],
    });
  }
}
