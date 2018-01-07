/* @flow */

import path from 'path';
import yargs from 'yargs';
import * as bundler from './services/bundler';
import * as publisher from './services/publisher';

function handler(ctx, h: (ctx: Object) => Promise<*>) {
  h(ctx).catch((err: Error) => {
    // eslint-disable-next-line no-console
    console.error(err.stack ? err.stack : err);
  });
}

async function build(ctx): Promise<*> {
  const cwd = process.cwd();
  await bundler.bundle({
    packagePath: cwd,
    inputPath: path.resolve(cwd, ctx.s),
    outputPath: path.resolve(cwd, ctx.o),
    comments: false,
  });
}

function prepare(): Promise<*> {
  return publisher.standardVersion();
}

async function publish(): Promise<*> {
  const githubToken = await publisher.getGithubToken();
  await publisher.gitPush();
  await publisher.npmPublish();
  await publisher.githubRelease(githubToken);
}

process.on('unhandledRejection', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('unhandledRejection', err.stack ? err.stack : err);
});

// eslint-disable-next-line no-unused-expressions
yargs
  .command({
    command: 'build',
    desc: 'Build a package',
    builder: y => y
      .option('s', {
        desc: 'Sources directory path',
        demandOption: true,
      })
      .option('o', {
        desc: 'Output directory path',
        demandOption: true,
      }),
    handler: ctx => handler(ctx, build),
  })
  .command({
    command: 'prepare',
    desc: 'Prepare a release of a package',
    handler: ctx => handler(ctx, prepare),
  })
  .command({
    command: 'publish',
    desc: 'Publish a release of a package',
    handler: ctx => handler(ctx, publish),
  })
  .argv;
