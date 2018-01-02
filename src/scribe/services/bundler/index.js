/* @flow */

import path from 'path';
import fs from 'fs';
import * as rollup from 'rollup';
import * as hulk from '@njakob/hulk';
import * as parcel from '@njakob/parcel';
import rollupNodeResolve from 'rollup-plugin-node-resolve';
import rollupBabel from 'rollup-plugin-babel';
import rollupJSON from 'rollup-plugin-json';

type BundleOptions = {
  packagePath: string;
  inputPath: string;
  outputPath: string;
  comments: boolean;
};

export async function bundle(options: BundleOptions) {
  const content = fs.readFileSync(path.resolve(options.packagePath, 'package.json'), 'utf-8');
  const pkg = parcel.parseParcel(JSON.parse(content));

  if (!pkg.name) {
    throw new Error('Package name field is missing in package.json');
  }
  if (!pkg.version) {
    throw new Error('Package version field is missing in package.json');
  }
  if (!pkg.homepage) {
    throw new Error('Package homepage field is missing in package.json');
  }

  const packageName = pkg.name.name;
  const packageFullName = pkg.name.fullName;
  const packageHomepage = pkg.homepage;
  const packageVersion = pkg.version;
  const packageDeps = pkg.dependencies.map(dependency => dependency.name && dependency.name.fullName);
  const packagePeerDeps = pkg.peerDependencies.map(dependency => dependency.name && dependency.name.fullName);

  const externalDeps = packageDeps
    .concat(packagePeerDeps)
    .filter((v, i, a) => a.indexOf(v) === i);

  const banner = hulk.banner({
    commitHash: hulk.getCommitHash(),
    version: packageVersion,
    name: packageFullName,
    repository: packageHomepage,
  });

  const rollupBundle = await rollup.rollup({
    input: options.inputPath,
    external: externalDeps,
    plugins: [
      rollupNodeResolve({
        jsnext: true,
      }),
      rollupJSON(),
      rollupBabel({
        babelrc: true,
        comments: options.comments,
      }),
    ],
  });

  await Promise.all([
    rollupBundle.write({
      banner,
      format: 'cjs',
      name: packageName,
      sourcemap: false,
      file: path.join(options.outputPath, `${packageName}.js`),
    }),
    rollupBundle.write({
      banner,
      format: 'es',
      name: packageName,
      sourcemap: false,
      file: path.join(options.outputPath, `${packageName}.es.js`),
    }),
  ]);
}
