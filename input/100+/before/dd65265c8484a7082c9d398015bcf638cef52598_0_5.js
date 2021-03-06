function (t) {
	var pathsAll, paths2, paths0, filesAll, files2, files0, replaceSep;
	replaceSep = function (path) {
		return path.replace(/\//g, sep);
	};
	pathsAll = [ 'done', 'done/done', 'done/done/dthree',
		'done/done/dthree/dthree', 'done/done/dthree/dthree/foo',
		'done/done/dthree/dtwo', 'done/done/dthree/dtwo/foo',
		'done/done/dthree/one', 'done/done/dthree/three', 'done/done/dthree/two',
		'done/done/dtwo', 'done/done/dtwo/dtwo', 'done/done/dtwo/dtwo/foo',
		'done/done/dtwo/one', 'done/done/dtwo/three', 'done/done/dtwo/two',
		'done/done/one', 'done/done/three', 'done/done/two', 'done/dtwo',
		'done/dtwo/foo', 'done/one', 'done/three', 'done/two', 'dthree',
		'dthree/dthree', 'dthree/dthree/done', 'dthree/dthree/done/dthree',
		'dthree/dthree/done/dthree/foo', 'dthree/dthree/done/one',
		'dthree/dthree/done/three', 'dthree/dthree/done/two', 'dthree/dthree/one',
		'dthree/dthree/three', 'dthree/dthree/two', 'dthree/dtwo',
		'dthree/dtwo/foo', 'dthree/one', 'dthree/three', 'dthree/two', 'dtwo',
		'dtwo/one', 'dtwo/three', 'dtwo/two', 'one', 'three', 'two']
		.map(replaceSep);

	paths2 = pathsAll.filter(function (path) {
		return path.split(sep).length < 4;
	});

	paths0 = pathsAll.filter(function (path) {
		return path.split(sep).length < 2;
	});

	files2 = paths2.filter(function (path) {
		return basename(path)[0] !== 'd';
	});

	return {
		"": {
			"0": function (a, d) {
				var reader = t(pgPath)
				  , testName = 'foo'
				  , testPath = resolve(pgPath, testName)
				  , paths = paths0
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(function (data) {
					a.deep(data, paths);
					return mkdir(testPath)
				})(delay(function () {
					a.deep(invoked.old, [], "Created: old");
					a.deep(invoked.new, [testName], "Created: new");
					invoked = false;
					reader(function (data) {
						var npaths = copy.call(paths);
						npaths.push(testName);
						a.deep(data, npaths.sort(), "Created: data");
					});
					return rmdir(testPath);
				}, 20))(delay(function () {
					a.deep(invoked.old, [testName], "Deleted: old");
					a.deep(invoked.new, [], "Deleted: new");
					invoked = false;
					reader(function (data) {
						a.deep(data, paths, "Deleted: data");
					});
				}, 20)).end(d);
			},
			"2": function (a, d) {
				var reader = t(pgPath, { depth: 2 })
				  , testName = replaceSep('dtwo/foo')
				  , testPath = resolve(pgPath, testName)
				  , paths = paths2
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(function (data) {
					a.deep(data, paths);
					return mkdir(testPath);
				})(delay(function () {
					a.deep(invoked.old, [], "Created: old");
					a.deep(invoked.new, [testName], "Created: new");
					invoked = false;
					reader(function (data) {
						var npaths = copy.call(paths);
						npaths.push(testName);
						a.deep(data, npaths.sort(), "Created: data");
					});
					return rmdir(testPath);
				}, 20))(delay(function () {
					a.deep(invoked.old, [testName], "Deleted: old");
					a.deep(invoked.new, [], "Deleted: new");
					invoked = false;
					reader(function (data) {
						a.deep(data, paths, "Deleted: data");
					});
				}, 20)).end(d);
			},
			"???": function (a, d) {
				var reader = t(pgPath, { depth: Infinity })
				  , testName = replaceSep('done/done/dthree/test')
				  , testPath = resolve(pgPath, testName)
				  , paths = pathsAll
				  , invoked = false;

				reader.on('change', function (data) {
					invoked = data;
				});
				reader(function (data) {
					a.deep(data, paths);
					return writeFile(testPath, 'foo');
				})(delay(function () {
					a.deep(invoked.old, [], "Created: old");
					a.deep(invoked.new, [testName], "Created: new");
					invoked = false;
					reader(function (data) {
						var npaths = copy.call(paths);
						npaths.push(testName);
						a.deep(data, npaths.sort(), "Created: data");
					});
					return unlink(testPath);
				}, 20))(delay(function () {
					a.deep(invoked.old, [testName], "Deleted: old");
					a.deep(invoked.new, [], "Deleted: new");
					invoked = false;
					reader(function (data) {
						a.deep(data, paths, "Deleted: data");
					});
				}, 20)).end(d);
			}
		},
		"Type": function (a, d) {
			var reader = t(pgPath, { depth: 2, type: { file: true } })
			  , testName = replaceSep('dtwo/test')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data, paths);
				return mkdir(testPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return writeFile(testPath, 'foo');
			}, 20))(delay(function () {
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				invoked = false;
				reader(function (data) {
					var npaths = copy.call(paths);
					npaths.push(testName);
					a.deep(data, npaths.sort(), "Created: data");
				});
				return unlink(testPath);
			}, 20))(delay(function () {
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
			}, 20)).end(d);
		},
		"Types": function (a, d) {
			var reader = t(pgPath, { depth: 2,
				type: { file: true, directory: true } })
			  , testName = replaceSep('dtwo/foo')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data, paths);
				return mkdir(testPath);
			})(delay(function () {
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				invoked = false;
				reader(function (data) {
					var npaths = copy.call(paths);
					npaths.push(testName);
					a.deep(data, npaths.sort(), "Created: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
			}, 20)).end(d);
		},
		"Pattern": function (a, d) {
			var pattern = /one$/, reader = t(pgPath, { depth: 2, pattern: pattern })
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dtwo/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
					return pattern.test(path);
				})
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data, paths);
				return mkdir(otherPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return rmdir(otherPath);
			}, 20))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return mkdir(testPath);
			}, 20))(delay(function () {
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				invoked = false;
				reader(function (data) {
					var npaths = copy.call(paths);
					npaths.push(testName);
					a.deep(data, npaths.sort(), "Created: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
			}, 20)).end(d);
		},
		"Pattern & Type": function (a, d) {
			var pattern = /one$/, reader = t(pgPath,
				{ depth: 2, type: { file: true }, pattern: pattern })
			  , testName = replaceSep('dtwo/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
					return pattern.test(path);
				})
			  , invoked = false;

			reader.on('change', function (data) {
				invoked = data;
			});
			reader(function (data) {
				a.deep(data, paths);
				return mkdir(testPath);
			})(delay(function () {
				a(invoked, false, "Created other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				a(invoked, false, "Deleted other type: event");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return writeFile(testPath, 'foo');
			}, 20))(delay(function () {
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				invoked = false;
				reader(function (data) {
					var npaths = copy.call(paths);
					npaths.push(testName);
					a.deep(data, npaths.sort(), "Created: data");
				});
				return unlink(testPath);
			}, 20))(delay(function () {
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				invoked = false;
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
			}, 20)).end(d);
		},
		"Ignored": function (a, d) {
			var gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dthree/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
					return path.indexOf('dtwo') === -1;
				})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, old: [], new: [] };
				invoked.forEach(function (data) {
					push.apply(result.new, data.new);
					push.apply(result.old, data.old);
				});
				invoked = [];
				return result;
			};

			paths.push('.gitignore');
			paths.sort();
			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(function () {
				reader = t(pgPath, { depth: 2, ignoreRules: 'git' });
				reader.on('change', function (data) {
					invoked.push(data);
				});
				return reader;
			}, 20))(function (data) {
				a.deep(data, paths);
				return mkdir(otherPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return rmdir(otherPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return mkdir(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				reader(function (data) {
					var paths = copy.call(paths);
					paths.push(testName);
					a.deep(data, paths.sort(), "Created: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
				return writeFile(ignoreFile, 'dtwo\none');
			}, 20))(delay(function () {
				var npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				var invoked = mergeInvoked();
				a.deep(invoked.old.sort(), diff.call(paths, npaths).sort(),
					"Ignored: old");
				a.deep(invoked.new, [], "Ignored: new");
				reader(function (data) {
					a.deep(data, npaths, "Ignored: data");
				});
				return deferred(rmdir(gitPath), unlink(ignoreFile));
			}, 20)).end(d);
		},
		"Ignored & Type": function (a, d) {
			var gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('dthree/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
					return path.indexOf('dtwo') === -1;
				})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, old: [], new: [] };
				invoked.forEach(function (data) {
					push.apply(result.new, data.new);
					push.apply(result.old, data.old);
				});
				invoked = [];
				return result;
			};

			paths.push('.gitignore');
			paths.sort();
			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, type: { file: true },
						ignoreRules: 'git' });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				}, 20
			))(function (data) {
				a.deep(data, paths);
				return writeFile(otherPath, 'foo');
			})(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return unlink(otherPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return writeFile(testPath, 'foo');
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				reader(function (data) {
					var paths = copy.call(paths);
					paths.push(testName);
					a.deep(data, paths.sort(), "Created: data");
				});
				return unlink(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
				return writeFile(ignoreFile, 'dtwo\none');
			}, 20))(delay(function () {
				var npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				var invoked = mergeInvoked();
				a.deep(invoked.old.sort(), diff.call(paths, npaths).sort(),
					"Ignored: old");
				a.deep(invoked.new, [], "Ignored: new");
				reader(function (data) {
					a.deep(data, npaths, "Ignored: data");
				});
				return deferred(rmdir(gitPath), unlink(ignoreFile));
			}, 20)).end(d);
		},
		"Ignored & Pattern": function (a, d) {
			var pattern = /done/, gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('done/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = paths2.filter(function (path) {
					return (path.indexOf('dtwo') === -1) && pattern.test(path);
				})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, old: [], new: [] };
				invoked.forEach(function (data) {
					push.apply(result.new, data.new);
					push.apply(result.old, data.old);
				});
				invoked = [];
				return result;
			};

			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(function () {
				reader = t(pgPath, { depth: 2, pattern: pattern, ignoreRules: 'git' });
				reader.on('change', function (data) {
					invoked.push(data);
				});
				return reader;
			}, 20))(function (data) {
				a.deep(data, paths);
				return mkdir(otherPath);
			})(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return rmdir(otherPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return mkdir(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				reader(function (data) {
					var paths = copy.call(paths);
					paths.push(testName);
					a.deep(data, paths.sort(), "Created: data");
				});
				return rmdir(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
				return writeFile(ignoreFile, 'dtwo\none');
			}, 20))(delay(function () {
				var npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				var invoked = mergeInvoked();
				a.deep(invoked.old.sort(), diff.call(paths, npaths).sort(),
					"Ignored: old");
				a.deep(invoked.new, [], "Ignored: new");
				reader(function (data) {
					a.deep(data, npaths, "Ignored: data");
				});
				return deferred(rmdir(gitPath), unlink(ignoreFile));
			}, 20)).end(d);
		},
		"Ignored & Pattern & Type": function (a, d) {
			var pattern = /done/, gitPath = resolve(pgPath, '.git')
			  , ignoreFile = resolve(pgPath, '.gitignore')
			  , otherName = replaceSep('dtwo/test')
			  , otherPath = resolve(pgPath, otherName)
			  , testName = replaceSep('done/fooone')
			  , testPath = resolve(pgPath, testName)
			  , paths = files2.filter(function (path) {
					return (path.indexOf('dtwo') === -1) && pattern.test(path);
				})
			  , reader, invoked = [], mergeInvoked;

			mergeInvoked = function () {
				var result;
				if (!invoked.length) {
					return false;
				}
				result = { data: invoked[0].data, old: [], new: [] };
				invoked.forEach(function (data) {
					push.apply(result.new, data.new);
					push.apply(result.old, data.old);
				});
				invoked = [];
				return result;
			};

			deferred(mkdir(gitPath), writeFile(ignoreFile, 'dtwo'))(delay(
				function () {
					reader = t(pgPath, { depth: 2, type: { file: true }, pattern: pattern,
						ignoreRules: 'git' });
					reader.on('change', function (data) {
						invoked.push(data);
					});
					return reader;
				}, 20
			))(function (data) {
				a.deep(data, paths);
				return writeFile(otherPath, 'foo');
			})(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Created other type: event");
				reader(function (data) {
					a.deep(data, paths, "Created other type: data");
				});
				return unlink(otherPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a(invoked, false, "Deleted other type: event");
				reader(function (data) {
					a.deep(data, paths, "Deleted other type: data");
				});
				return writeFile(testPath, 'foo');
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [], "Created: old");
				a.deep(invoked.new, [testName], "Created: new");
				reader(function (data) {
					var paths = copy.call(paths);
					paths.push(testName);
					a.deep(data, paths.sort(), "Created: data");
				});
				return unlink(testPath);
			}, 20))(delay(function () {
				var invoked = mergeInvoked();
				a.deep(invoked.old, [testName], "Deleted: old");
				a.deep(invoked.new, [], "Deleted: new");
				reader(function (data) {
					a.deep(data, paths, "Deleted: data");
				});
				return writeFile(ignoreFile, 'dtwo\none');
			}, 20))(delay(function () {
				var npaths = paths.filter(function (path) {
					return (path !== 'one') && (path.indexOf(sep + 'one') === -1);
				}).sort();
				var invoked = mergeInvoked();
				a.deep(invoked.old.sort(), diff.call(paths, npaths).sort(),
					"Ignored: old");
				a.deep(invoked.new, [], "Ignored: new");
				reader(function (data) {
					a.deep(data, npaths, "Ignored: data");
				});
				return deferred(rmdir(gitPath), unlink(ignoreFile));
			}, 20)).end(d);
		}
	};
}