var grunt = require('grunt'),
  assert = require('assert'),
  fs = require('fs'),
  lockFileExtendedLib = require('../tasks/grunt_lock')(grunt);

test('Test matches function using minimatch', function() {
  assert.equal(lockFileExtendedLib.matches('foobar', '*'), true);
  assert.equal(lockFileExtendedLib.matches('foobar', 'foo*'), true);
  assert.equal(lockFileExtendedLib.matches('foobar', '*bar'), true);
  assert.equal(lockFileExtendedLib.matches('foobar', '*foo'), false);
  assert.equal(lockFileExtendedLib.matches('foobar', 'bar*'), false);
});

test('Normalize task Array', function() {
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList('foobar'), ['foobar']);
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList(['foobar']), ['foobar']);
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList(['foo','bar','baz']), ['foo','bar','baz']);
  
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList([]), false);
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList({}), false);
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList(''), false);
  assert.deepEqual(lockFileExtendedLib.normalizeTaskList(false), false);
});

test('check for matching tasks', function() {
  var patterns = ['foo*','*bar','baz'];
  
  assert.notEqual(lockFileExtendedLib.checkForTask(patterns, ['lalalala']), true);
  assert.equal(lockFileExtendedLib.checkForTask(patterns, ['foo', 'bar', 'baz']), true);
  assert.equal(lockFileExtendedLib.checkForTask(patterns, ['foooooooo', 'babababar', 'baz']), true);
  assert.notEqual(lockFileExtendedLib.checkForTask(patterns, ['foooooooo', 'barrrrr', 'baz']), true);
  assert.notEqual(lockFileExtendedLib.checkForTask(patterns, ['ffoooooooo', 'babababar', 'baz']), true);
  assert.notEqual(lockFileExtendedLib.checkForTask(patterns, ['foo', 'bar', 'bazzzz']), true);
  assert.equal(lockFileExtendedLib.checkForTask(patterns, ['lalalala']), 'lalalala', 'The not matching taskname have to be returned');
});

test('check for matching allowed Tasks', function() {
  var patterns = ['foo*','*bar','baz'];
  assert.equal(lockFileExtendedLib.checkForAllowedTask(patterns, ['foo']), true);
  assert.equal(lockFileExtendedLib.checkForAllowedTask('', ['foo']), true, 'empty tasklist should return true');
  assert.equal(lockFileExtendedLib.checkForAllowedTask(false, ['test']), true, 'empty tasklist should return true');
});

test('check for matching ignored Tasks', function() {
  var patterns = ['foo*','*bar','baz'];
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(patterns, ['foo']), true);
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(patterns, ['bar']), true);
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(patterns, ['baz']), true);
  
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(patterns, ['']), false, 'empty tasklist should return false');
  assert.equal(lockFileExtendedLib.checkForIgnoredTask('', ['test']), false, 'empty tasklist should return false');
  assert.equal(lockFileExtendedLib.checkForIgnoredTask({}, ['test']), false, 'empty tasklist should return false');
  assert.equal(lockFileExtendedLib.checkForIgnoredTask([], ['test']), false, 'empty tasklist should return false');
  
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(['test1','test2','test3','test4','test5'], ['test1','test3','test5']), true, 'all tasks are inside the ignroe array and a true sould return');
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(['test1'], ['test1', 'test2']), false, 'test2 does not match the pattern array. a false sould return');
  assert.equal(lockFileExtendedLib.checkForIgnoredTask(['test*'], ['testFoo', 'testBar', 'FAILTASK']), false, 'FAILTASK does not match the pattern array. a false sould return');
});

test('test create lockfile', function() {
  var path = 'foobar.lck';
  lockFileExtendedLib.createLock({path: path})
  
  assert.equal(fs.existsSync(path), true);
  var lockInfo = grunt.file.readJSON(path);
  var lockMessage = grunt.log.uncolor(lockFileExtendedLib.getLockInfo(lockInfo));
  assert.equal(lockMessage.length > 0, true, 'The lockmessage should countain at least some information');

  assert.equal(lockInfo.user.length > 0, true);
  assert.equal(lockInfo.pid > 0, true);
  assert.equal(lockInfo.created.length, 19, 'In created have to be a SQL-Formatted timestamp');
});