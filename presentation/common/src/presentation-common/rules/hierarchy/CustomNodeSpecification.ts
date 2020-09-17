/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module PresentationRules
 */

import { ChildNodeSpecificationBase, ChildNodeSpecificationTypes } from "./ChildNodeSpecification";

/**
 * Creates a custom-defined node.
 *
 * @see [More details]($docs/learning/presentation/Hierarchies/CustomNode.md)
 * @public
 */
export interface CustomNodeSpecification extends ChildNodeSpecificationBase {
  /** Used for serializing to JSON. */
  specType: ChildNodeSpecificationTypes.CustomNode;

  /** Type of the node. */
  type: string;

  /**
   * Label of the node. May be [localized]($docs/learning/presentation/Localization.md).
   */
  label: string;

  /**
   * Description of the node. May be [localized]($docs/learning/presentation/Localization.md).
   */
  description?: string;

  /** Id of the image to use for this custom node. */
  imageId?: string;
}
