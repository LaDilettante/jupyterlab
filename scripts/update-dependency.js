#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var childProcess = require('child_process');
var sortPackageJson = require('sort-package-json');


// Make sure we have required command line arguments.
if (process.argv.length !== 3) {
  var msg = '** Must supply an update specifier\n';
  process.stderr.write(msg);
  process.exit(1);
}

// Extract the desired library target and specifier.
var parts = process.argv[2].split('@');

// Translate @latest to a concrete version.
if (parts.length == 1 || parts[1] == 'latest') {
  var cmd = 'npm view ' + target + ' version';
  parts.push('~' + String(childProcess.execSync(cmd)).trim());
}
var name = parts[0];
var specifier = parts[1];

// Get all of the packages.
var basePath = path.resolve('.');
var lernaConfig = require(path.join(basePath, 'lerna.json'));
var packageConfig = lernaConfig.packages;


// Handle the packages
for (var i = 0; i < packageConfig.length; i++) {
  var files = glob.sync(path.join(basePath, packageConfig[i]));
  for (var j = 0; j < files.length; j++) {
    handlePackage(files[j]);
  }
}
handlePackage(basePath);


/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath) {
  // Read in the package.json.
  var packagePath = path.join(packagePath, 'package.json');
  try {
    var package = require(packagePath);
  } catch (e) {
    console.log('Skipping package ' + packagePath);
    return;
  }

  // Update dependencies as appropriate.
  if (target in package['dependencies']) {
    package['dependencies'][target] = specifier;
  } else if (target in package['devDependencies']) {
    package['devDependencies'][target] = specifier;
  }

  // Write the file back to disk.
  var text = JSON.stringify(sortPackageJson(data), null, 2) + '\n';
  fs.writeFileSync(packagePath, text);
}
