/* @flow */

import { spawn } from 'child_process';
import standardVersionImpl from 'standard-version';
import conventionalGithubReleaser from 'conventional-github-releaser';

export async function getGithubToken(): Promise<string> {
  const githubToken = process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN;
  if (!githubToken) {
    throw new Error('Environement variable CONVENTIONAL_GITHUB_RELEASER_TOKEN is missing');
  }
  return githubToken;
}

export function standardVersion() {
  return standardVersionImpl({
    noVerify: true,
    sign: true,
    silent: true,
    message: 'chore: Bump %s',
  });
}

export function npmPublish(): Promise<*> {
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['publish'], { env: process.env });
    let stderr = '';
    npm.stderr.on('data', (buf) => {
      stderr += buf;
    });
    npm.on('close', (code) => {
      if (code !== 0) {
        if (/code ENEEDAUTH/.test(stderr)) {
          reject(new Error('NPM authenticate required'));
        } else {
          reject(new Error('Unexpected NPM exit code'));
        }
        return;
      }
      resolve();
    });
  });
}

export function gitPush(): Promise<*> {
  return new Promise((resolve, reject) => {
    const git = spawn('git', ['push', '--follow-tags', 'origin', 'master']);
    git.on('close', (code) => {
      if (code !== 0) {
        reject();
        return;
      }
      resolve();
    });
  });
}

export function githubRelease(githubToken: string): Promise<*> {
  return new Promise((resolve, reject) => {
    conventionalGithubReleaser({
      type: 'oauth',
      token: githubToken,
    }, {
      preset: 'angular'
    }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}
