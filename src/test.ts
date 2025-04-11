// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Remove the previous `require.context` approach
// and use Angular's testing environment initialization.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Dynamically import all the .spec.ts files.
const context = (require as any).context('./', true, /\.spec\.ts$/);

// Load all the tests.
context.keys().forEach(context);

