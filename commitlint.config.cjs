// Conventional Commits — https://www.conventionalcommits.org
// Used by commitlint and the conventional-pre-commit hook.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert', 'security',
    ]],
    'subject-max-length': [2, 'always', 72],
  },
};
