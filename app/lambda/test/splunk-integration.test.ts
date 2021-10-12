import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SplunkIntegration from '../lib/splunk-integration-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SplunkIntegration.SplunkIntegrationStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
