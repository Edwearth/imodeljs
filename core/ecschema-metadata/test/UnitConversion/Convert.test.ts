/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  Schema,
  SchemaContext,
  SchemaItemKey,
  SchemaKey,
} from "../../src/ecschema-metadata";
import { KnownLocations } from '../../../backend/src/IModelHost';
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import { Float } from "../../src/UnitConversion/Float";
import { UnitConvertorContext } from "../../src/UnitConversion/Convert";
import { deserializeXml } from "./DeserializeSchema";

interface TestData {
  From: string;
  Input: number;
  To: string;
  Expect: number;
}

describe("A unit tree creator", () => {
  const context = new SchemaContext();

  const testData: TestData[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "./unit-test-data.json"), "utf-8")
  );

  before(() => {
    const schemaFile = path.join(KnownLocations.nativeAssetsDir, "ECSchemas", "Standard", `Units.ecschema.xml`);
    const schemaXml = fs.readFileSync(schemaFile, "utf-8");
    const schema: Schema = deserializeXml(context, schemaXml as string);
    context.addSchema(schema);
  });

  testData.forEach((test: TestData) => {
    it(`should convert ${test.From} to ${test.To}`, async () => {
      const converter = new UnitConvertorContext(context);
      const schemaKey = new SchemaKey("Units");
      const from = new SchemaItemKey(test.From, schemaKey);
      const to = new SchemaItemKey(test.To, schemaKey);
      const map = await converter.processSchemaItem(from, to);
      const actual = map.evaluate(test.Input);
      const ulp = Float.ulp(Math.max(test.Input, test.Expect));
      expect(
        Float.equals(test.Expect, actual, 3 * ulp),
        `${test.Input} ${test.From} in ${test.To} should be ${
          test.Expect
        } and not ${actual} error = ${Math.abs(test.Expect - actual)} > ${
          3 * ulp
        }`
      ).to.be.true;
    });
  });
});
