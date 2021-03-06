function() {
  Ext.define('ExampleClass', {
    config: {
      parameter: null
    },
    constructor: function(config) {
      this.initConfig(config);
      return this;
    }
  });
  Ext.define('ExampleSingletonClass', {
    singleton: true,
    constructor: function(config) {
      this.initConfig(config);
      return this;
    }
  });
  beforeEach(function() {
    this.addMatchers({
      toBeInstanceOf: function(className) {
        return this.actual instanceof Ext.ClassManager.get(className);
      }
    });
  });
  describe('Configuration', function() {
    var configuredIdentifiers, describeConfigurationByValueOfType, typeDescriptor, typeDescriptors, _i, _len;
    describe('Configuration with a class name as a String', function() {
      it('should be configurable with a class name as a String', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameAsString: 'ExampleClass'
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameAsString')).toBe(true);
      });
      describe('Resolution of a dependency configured with a class name as a String', function() {
        it("should resolve a dependency configured with a class name as a String with the corresponding singleton class instance", function() {
          var classNameAsStringInstance;
          expect(classNameAsStringInstance = Deft.Injector.resolve('classNameAsString')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('classNameAsString')).toBe(classNameAsStringInstance);
        });
      });
    });
    describe('Configuration with a class name', function() {
      var expectedClassNameAsSingletonEagerlyInstance, expectedClassNameEagerlyInstance;
      expectedClassNameEagerlyInstance = null;
      expectedClassNameAsSingletonEagerlyInstance = null;
      it('should be configurable with a class name', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          className: {
            className: 'ExampleClass'
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('className')).toBe(true);
      });
      it('should be configurable with a class name, eagerly', function() {
        var constructorSpy;
        constructorSpy = spyOn(ExampleClass.prototype, 'constructor').andCallFake(function() {
          expectedClassNameEagerlyInstance = this;
          return constructorSpy.originalValue.apply(this, arguments);
        });
        Deft.Injector.configure({
          classNameEagerly: {
            className: 'ExampleClass',
            eager: true
          }
        });
        expect(ExampleClass.prototype.constructor).toHaveBeenCalled();
        expect(expectedClassNameEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(Deft.Injector.canResolve('classNameEagerly')).toBe(true);
      });
      it('should be configurable with a class name, (explicity) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameLazily: {
            className: 'ExampleClass',
            eager: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameLazily')).toBe(true);
      });
      it('should be configurable with a class name, (explicitly) as a singleton', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameAsSingleton: {
            className: 'ExampleClass',
            singleton: true
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameAsSingleton')).toBe(true);
      });
      it('should be configurable with a class name, (explicitly) as a singleton, eagerly', function() {
        var constructorSpy;
        constructorSpy = spyOn(ExampleClass.prototype, 'constructor').andCallFake(function() {
          expectedClassNameAsSingletonEagerlyInstance = this;
          return constructorSpy.originalValue.apply(this, arguments);
        });
        Deft.Injector.configure({
          classNameAsSingletonEagerly: {
            className: 'ExampleClass',
            singleton: true,
            eager: true
          }
        });
        expect(ExampleClass.prototype.constructor).toHaveBeenCalled();
        expect(expectedClassNameAsSingletonEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(Deft.Injector.canResolve('classNameAsSingletonEagerly')).toBe(true);
      });
      it('should be configurable with a class name, (explicitly) as a singleton, (explicitly) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameAsSingletonLazily: {
            className: 'ExampleClass',
            singleton: true,
            eager: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameAsSingletonLazily')).toBe(true);
      });
      it('should be configurable with a class name, as a prototype', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameAsPrototype: {
            className: 'ExampleClass',
            singleton: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameAsPrototype')).toBe(true);
      });
      it('should not be configurable with a class name, as a prototype, eagerly', function() {
        expect(function() {
          Deft.Injector.configure({
            classNameAsPrototypeEagerly: {
              className: 'ExampleClass',
              singleton: false,
              eager: true
            }
          });
        }).toThrow(new Error("Error while configuring 'classNameAsPrototypeEagerly': only singletons can be created eagerly."));
      });
      it('should be configurable with a class name, as a prototype, (explicitly) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameAsPrototypeLazily: {
            className: 'ExampleClass',
            singleton: false,
            eager: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameAsPrototypeLazily')).toBe(true);
      });
      describe('Resolution of a dependency configured with a class name', function() {
        it('should resolve a dependency configured with a class name with the corresponding singleton class instance', function() {
          var classNameInstance;
          expect(classNameInstance = Deft.Injector.resolve('className')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('className')).toBe(classNameInstance);
        });
        it('should resolve a dependency configured with a class name, eagerly, with the corresponding singleton class instance', function() {
          expect(Deft.Injector.resolve('classNameEagerly')).toBe(expectedClassNameEagerlyInstance);
          expect(Deft.Injector.resolve('classNameEagerly')).toBe(expectedClassNameEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameLazilyInstance;
          expect(classNameLazilyInstance = Deft.Injector.resolve('classNameLazily')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('classNameLazily')).toBe(classNameLazilyInstance);
        });
        it('should resolve a dependency configured with a class name, (explicitly) as a singleton, with the corresponding singleton class instance', function() {
          var classNameAsSingletonInstance;
          expect(classNameAsSingletonInstance = Deft.Injector.resolve('classNameAsSingleton')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('classNameAsSingleton')).toBe(classNameAsSingletonInstance);
        });
        it('should resolve a dependency configured with a class name, (explicitly) as a singleton, eagerly, with the corresponding singleton class instance', function() {
          expect(Deft.Injector.resolve('classNameAsSingletonEagerly')).toBe(expectedClassNameAsSingletonEagerlyInstance);
          expect(Deft.Injector.resolve('classNameAsSingletonEagerly')).toBe(expectedClassNameAsSingletonEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name, (explicitly) as a singleton, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameAsSingletonLazilyInstance;
          expect(classNameAsSingletonLazilyInstance = Deft.Injector.resolve('classNameAsSingletonLazily')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('classNameAsSingletonLazily')).toBe(classNameAsSingletonLazilyInstance);
        });
        it('should resolve a dependency configured with a class name, as a prototype, with the corresponding prototype class instance', function() {
          var classNameAsPrototypeInstance1, classNameAsPrototypeInstance2;
          classNameAsPrototypeInstance1 = Deft.Injector.resolve('classNameAsPrototype');
          classNameAsPrototypeInstance2 = Deft.Injector.resolve('classNameAsPrototype');
          expect(classNameAsPrototypeInstance1).toBeInstanceOf('ExampleClass');
          expect(classNameAsPrototypeInstance2).toBeInstanceOf('ExampleClass');
          expect(classNameAsPrototypeInstance1).not.toBe(classNameAsPrototypeInstance2);
        });
        it('should resolve a dependency configured with a class name, as a prototype, (explicitly) lazily, with the corresponding prototype class instance', function() {
          var classNameAsPrototypeLazilyInstance1, classNameAsPrototypeLazilyInstance2;
          classNameAsPrototypeLazilyInstance1 = Deft.Injector.resolve('classNameAsPrototypeLazily');
          classNameAsPrototypeLazilyInstance2 = Deft.Injector.resolve('classNameAsPrototypeLazily');
          expect(classNameAsPrototypeLazilyInstance1).toBeInstanceOf('ExampleClass');
          expect(classNameAsPrototypeLazilyInstance2).toBeInstanceOf('ExampleClass');
          expect(classNameAsPrototypeLazilyInstance1).not.toBe(classNameAsPrototypeLazilyInstance2);
        });
      });
    });
    describe('Configuration with a class name and constructor parameters', function() {
      var expectedClassNameWithParametersAsSingletonEagerlyInstance, expectedClassNameWithParametersEagerlyInstance;
      expectedClassNameWithParametersEagerlyInstance = null;
      expectedClassNameWithParametersAsSingletonEagerlyInstance = null;
      it('should be configurable with a class name and constructor parameters', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParameters: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ]
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParameters')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, eagerly', function() {
        var constructorSpy;
        constructorSpy = spyOn(ExampleClass.prototype, 'constructor').andCallFake(function() {
          expectedClassNameWithParametersEagerlyInstance = this;
          return constructorSpy.originalValue.apply(this, arguments);
        });
        Deft.Injector.configure({
          classNameWithParametersEagerly: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            eager: true
          }
        });
        expect(ExampleClass.prototype.constructor).toHaveBeenCalled();
        expect(expectedClassNameWithParametersEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(expectedClassNameWithParametersEagerlyInstance.getParameter()).toEqual('expected value');
        expect(Deft.Injector.canResolve('classNameWithParametersEagerly')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, (explicitly) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParametersLazily: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            eager: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParametersLazily')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, (explicitly) as a singleton', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParametersAsSingleton: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            singleton: true
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParametersAsSingleton')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, as a singleton, eagerly', function() {
        var constructorSpy;
        constructorSpy = spyOn(ExampleClass.prototype, 'constructor').andCallFake(function() {
          expectedClassNameWithParametersAsSingletonEagerlyInstance = this;
          return constructorSpy.originalValue.apply(this, arguments);
        });
        Deft.Injector.configure({
          classNameWithParametersAsSingletonEagerly: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            singleton: true,
            eager: true
          }
        });
        expect(ExampleClass.prototype.constructor).toHaveBeenCalled();
        expect(expectedClassNameWithParametersAsSingletonEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(expectedClassNameWithParametersAsSingletonEagerlyInstance.getParameter()).toEqual('expected value');
        expect(Deft.Injector.canResolve('classNameWithParametersAsSingletonEagerly')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, (explicitly) as a singleton, (explicitly) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParametersAsSingletonLazily: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            singleton: true,
            eager: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParametersAsSingletonLazily')).toBe(true);
      });
      it('should be configurable with a class name and constructor parameters, as a prototype', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParametersAsPrototype: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            singleton: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParametersAsPrototype')).toBe(true);
      });
      it('should not be configurable with a class name and constructor parameters, as a prototype, eagerly', function() {
        expect(function() {
          Deft.Injector.configure({
            classNameWithParametersAsPrototypeEagerly: {
              className: 'ExampleClass',
              parameters: [
                {
                  parameter: 'expected value'
                }
              ],
              singleton: false,
              eager: true
            }
          });
        }).toThrow(new Error("Error while configuring 'classNameWithParametersAsPrototypeEagerly': only singletons can be created eagerly."));
      });
      it('should be configurable with a class name and constructor parameters, as a prototype, (explicitly) lazily', function() {
        spyOn(ExampleClass.prototype, 'constructor').andCallThrough();
        Deft.Injector.configure({
          classNameWithParametersAsPrototypeLazily: {
            className: 'ExampleClass',
            parameters: [
              {
                parameter: 'expected value'
              }
            ],
            singleton: false
          }
        });
        expect(ExampleClass.prototype.constructor).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('classNameWithParametersAsPrototypeLazily')).toBe(true);
      });
      describe('Resolution of a dependency configured with a class name and constructor parameters', function() {
        it('should resolve a dependency configured with a class name and constructor parameters with the corresponding singleton class instance', function() {
          var classNameWithParametersInstance;
          expect(classNameWithParametersInstance = Deft.Injector.resolve('classNameWithParameters')).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersInstance.getParameter()).toEqual('expected value');
          expect(Deft.Injector.resolve('classNameWithParameters')).toBe(classNameWithParametersInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, eagerly, with the corresponding singleton class instance', function() {
          expect(Deft.Injector.resolve('classNameWithParametersEagerly')).toBe(expectedClassNameWithParametersEagerlyInstance);
          expect(Deft.Injector.resolve('classNameWithParametersEagerly')).toBe(expectedClassNameWithParametersEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameWithParametersLazilyInstance;
          expect(classNameWithParametersLazilyInstance = Deft.Injector.resolve('classNameWithParametersLazily')).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersLazilyInstance.getParameter()).toEqual('expected value');
          expect(Deft.Injector.resolve('classNameWithParametersLazily')).toBe(classNameWithParametersLazilyInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, (explicitly) as a singleton, with the corresponding singleton class instance', function() {
          var classNameWithParametersAsSingletonInstance;
          expect(classNameWithParametersAsSingletonInstance = Deft.Injector.resolve('classNameWithParametersAsSingleton')).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsSingletonInstance.getParameter()).toEqual('expected value');
          expect(Deft.Injector.resolve('classNameWithParametersAsSingleton')).toBe(classNameWithParametersAsSingletonInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, (explicitly) as a singleton, eagerly, with the corresponding singleton class instance', function() {
          expect(Deft.Injector.resolve('classNameWithParametersAsSingletonEagerly')).toBe(expectedClassNameWithParametersAsSingletonEagerlyInstance);
          expect(Deft.Injector.resolve('classNameWithParametersAsSingletonEagerly')).toBe(expectedClassNameWithParametersAsSingletonEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, (explicitly) as a singleton, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameWithParametersAsSingletonLazilyInstance;
          expect(classNameWithParametersAsSingletonLazilyInstance = Deft.Injector.resolve('classNameWithParametersAsSingletonLazily')).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsSingletonLazilyInstance.getParameter()).toEqual('expected value');
          expect(Deft.Injector.resolve('classNameWithParametersAsSingletonLazily')).toBe(classNameWithParametersAsSingletonLazilyInstance);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, as a prototype, with the corresponding prototype class instance', function() {
          var classNameWithParametersAsPrototypeInstance1, classNameWithParametersAsPrototypeInstance2;
          classNameWithParametersAsPrototypeInstance1 = Deft.Injector.resolve('classNameWithParametersAsPrototype');
          classNameWithParametersAsPrototypeInstance2 = Deft.Injector.resolve('classNameWithParametersAsPrototype');
          expect(classNameWithParametersAsPrototypeInstance1).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsPrototypeInstance1.getParameter()).toEqual('expected value');
          expect(classNameWithParametersAsPrototypeInstance2).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsPrototypeInstance2.getParameter()).toEqual('expected value');
          expect(classNameWithParametersAsPrototypeInstance1).not.toBe(classNameWithParametersAsPrototypeInstance2);
        });
        it('should resolve a dependency configured with a class name and constructor parameters, as a prototype, (explicitly) lazily, with the corresponding prototype class instance', function() {
          var classNameWithParametersAsPrototypeLazilyInstance1, classNameWithParametersAsPrototypeLazilyInstance2;
          classNameWithParametersAsPrototypeLazilyInstance1 = Deft.Injector.resolve('classNameWithParametersAsPrototypeLazily');
          classNameWithParametersAsPrototypeLazilyInstance2 = Deft.Injector.resolve('classNameWithParametersAsPrototypeLazily');
          expect(classNameWithParametersAsPrototypeLazilyInstance1).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsPrototypeLazilyInstance1.getParameter()).toEqual('expected value');
          expect(classNameWithParametersAsPrototypeLazilyInstance2).toBeInstanceOf('ExampleClass');
          expect(classNameWithParametersAsPrototypeLazilyInstance2.getParameter()).toEqual('expected value');
          expect(classNameWithParametersAsPrototypeLazilyInstance1).not.toBe(classNameWithParametersAsPrototypeLazilyInstance2);
        });
      });
    });
    describe('Configuration with a class name for a singleton class', function() {
      it('should be configurable with a class name for a singleton class', function() {
        Deft.Injector.configure({
          classNameForSingletonClass: {
            className: 'ExampleSingletonClass'
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClass')).toBe(true);
      });
      it('should not be configurable with a class name for a singleton class and constructor parameters', function() {
        expect(function() {
          return Deft.Injector.configure({
            classNameForSingletonClassWithParameters: {
              className: 'ExampleSingletonClass',
              parameters: [
                {
                  parameter: 'expected value'
                }
              ]
            }
          });
        }).toThrow(new Error("Error while configuring rule for 'classNameForSingletonClassWithParameters': parameters cannot be applied to singleton classes. Consider removing 'singleton: true' from the class definition."));
      });
      it('should be configurable with a class name for a singleton class, eagerly', function() {
        Deft.Injector.configure({
          classNameForSingletonClassEagerly: {
            className: 'ExampleSingletonClass',
            eager: true
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClassEagerly')).toBe(true);
      });
      it('should be configurable with a class name for a singleton class, (explicitly) lazily', function() {
        Deft.Injector.configure({
          classNameForSingletonClassLazily: {
            className: 'ExampleSingletonClass',
            eager: false
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClassLazily')).toBe(true);
      });
      it('should be configurable with a class name for a singleton class, (explicitly) as a singleton', function() {
        Deft.Injector.configure({
          classNameForSingletonClassAsSingleton: {
            className: 'ExampleSingletonClass',
            singleton: true
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClassAsSingleton')).toBe(true);
      });
      it('should be configurable with a class name for a singleton class, (explicitly) as a singleton, eagerly', function() {
        Deft.Injector.configure({
          classNameForSingletonClassAsSingletonEagerly: {
            className: 'ExampleSingletonClass',
            singleton: true,
            eager: true
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClassAsSingletonEagerly')).toBe(true);
      });
      it('should be configurable with a class name for a singleton class, (explicitly) as a singleton, (explicitly) lazily', function() {
        Deft.Injector.configure({
          classNameForSingletonClassAsSingletonLazily: {
            className: 'ExampleSingletonClass',
            singleton: true,
            eager: false
          }
        });
        expect(Deft.Injector.canResolve('classNameForSingletonClassAsSingletonLazily')).toBe(true);
      });
      it('should not be configurable with a class name for a singleton class, as a prototype', function() {
        expect(function() {
          return Deft.Injector.configure({
            classNameForSingletonClassAsPrototype: {
              className: 'ExampleSingletonClass',
              singleton: false
            }
          });
        }).toThrow(new Error("Error while configuring rule for 'classNameForSingletonClassAsPrototype': singleton classes cannot be configured for injection as a prototype. Consider removing 'singleton: true' from the class definition."));
      });
      it('should not be configurable with a class name for a singleton class, as a prototype, eagerly', function() {
        expect(function() {
          return Deft.Injector.configure({
            classNameForSingletonClassAsPrototypeEagerly: {
              className: 'ExampleSingletonClass',
              singleton: false,
              eager: true
            }
          });
        }).toThrow(new Error("Error while configuring 'classNameForSingletonClassAsPrototypeEagerly': only singletons can be created eagerly."));
      });
      it('should not be configurable with a class name for a singleton class, as a prototype, (explicitly) lazily', function() {
        expect(function() {
          return Deft.Injector.configure({
            classNameForSingletonClassAsPrototypeLazily: {
              className: 'ExampleSingletonClass',
              singleton: false,
              eager: false
            }
          });
        }).toThrow(new Error("Error while configuring rule for 'classNameForSingletonClassAsPrototypeLazily': singleton classes cannot be configured for injection as a prototype. Consider removing 'singleton: true' from the class definition."));
      });
      describe('Resolution of a dependency configured with a class name for a singleton class', function() {
        it('should resolve a dependency configured with a class name for a singleton class with the corresponding singleton class instance', function() {
          var classNameForSingletonClassInstance;
          expect(classNameForSingletonClassInstance = Deft.Injector.resolve('classNameForSingletonClass')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClass')).toBe(classNameForSingletonClassInstance);
        });
        it('should resolve a dependency configured with a class name for a singleton class, eagerly, with the corresponding singleton class instance', function() {
          var classNameForSingletonClassEagerlyInstance;
          expect(classNameForSingletonClassEagerlyInstance = Deft.Injector.resolve('classNameForSingletonClassEagerly')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClassEagerly')).toBe(classNameForSingletonClassEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name for a singleton class, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameForSingletonClassEagerlyInstance;
          expect(classNameForSingletonClassEagerlyInstance = Deft.Injector.resolve('classNameForSingletonClassLazily')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClassLazily')).toBe(classNameForSingletonClassEagerlyInstance);
        });
        it('should resolve a dependency configured with a class name for a singleton class, (explicitly) as a singleton, with the corresponding singleton class instance', function() {
          var classNameForSingletonClassAsSingletonInstance;
          expect(classNameForSingletonClassAsSingletonInstance = Deft.Injector.resolve('classNameForSingletonClassAsSingleton')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClassAsSingleton')).toBe(classNameForSingletonClassAsSingletonInstance);
        });
        it('should resolve a dependency configured with a class name for a singleton class, (explicitly) as a singleton, eagerly, with the corresponding singleton class instance', function() {
          var classNameForSingletonClassAsSingletonEagerlyInstance;
          expect(classNameForSingletonClassAsSingletonEagerlyInstance = Deft.Injector.resolve('classNameForSingletonClassAsSingletonEagerly')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClassAsSingletonEagerly')).toBe(classNameForSingletonClassAsSingletonEagerlyInstance);
        });
        return it('should resolve a dependency configured with a class name for a singleton class, (explicitly) as a singleton, (explicitly) lazily, with the corresponding singleton class instance', function() {
          var classNameForSingletonClassAsSingletonLazilyInstance;
          expect(classNameForSingletonClassAsSingletonLazilyInstance = Deft.Injector.resolve('classNameForSingletonClassAsSingletonLazily')).toBe(ExampleSingletonClass);
          expect(Deft.Injector.resolve('classNameForSingletonClassAsSingletonLazily')).toBe(classNameForSingletonClassAsSingletonLazilyInstance);
        });
      });
    });
    describe('Configuration with a factory function', function() {
      var expectedFnAsSingletonEagerlyInstance, expectedFnEagerlyInstance, factoryFunction;
      factoryFunction = function() {
        return Ext.create('ExampleClass');
      };
      expectedFnEagerlyInstance = null;
      expectedFnAsSingletonEagerlyInstance = null;
      it('should be configurable with a factory function', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fn: {
            fn: factoryFunctionSpy
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fn')).toBe(true);
      });
      it('should be configurable with a factory function, eagerly', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(function() {
          return expectedFnEagerlyInstance = factoryFunction.apply(this, arguments);
        });
        Deft.Injector.configure({
          fnEagerly: {
            fn: factoryFunctionSpy,
            eager: true
          }
        });
        expect(factoryFunctionSpy).toHaveBeenCalled();
        expect(expectedFnEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(Deft.Injector.canResolve('fnEagerly')).toBe(true);
      });
      it('should be configurable with a factory function, (explicitly) lazily', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnLazily: {
            fn: factoryFunctionSpy,
            eager: false
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fnLazily')).toBe(true);
      });
      it('should be configurable with a factory function, (explicitly) as a singleton', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnAsSingleton: {
            fn: factoryFunctionSpy,
            singleton: true
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fnAsSingleton')).toBe(true);
      });
      it('should be configurable with a factory function, (explicitly) as a singleton, eagerly', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(function() {
          return expectedFnAsSingletonEagerlyInstance = factoryFunction.apply(this, arguments);
        });
        Deft.Injector.configure({
          fnAsSingletonEagerly: {
            fn: factoryFunctionSpy,
            singleton: true,
            eager: true
          }
        });
        expect(factoryFunctionSpy).toHaveBeenCalled();
        expect(expectedFnAsSingletonEagerlyInstance).toBeInstanceOf('ExampleClass');
        expect(Deft.Injector.canResolve('fnAsSingletonEagerly')).toBe(true);
      });
      it('should be configurable with a factory function, (explicitly) as a singleton, (explicitly) lazily', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnAsSingletonLazily: {
            fn: factoryFunctionSpy,
            singleton: true,
            eager: false
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fnAsSingletonLazily')).toBe(true);
      });
      it('should be configurable with a factory function, as a prototype', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnAsPrototype: {
            fn: factoryFunctionSpy,
            singleton: false
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fnAsPrototype')).toBe(true);
      });
      it('should not be configurable with a factory function, as a prototype, eagerly', function() {
        expect(function() {
          Deft.Injector.configure({
            fnAsPrototypeEagerly: {
              fn: factoryFunction,
              singleton: false,
              eager: true
            }
          });
        }).toThrow(new Error("Error while configuring 'fnAsPrototypeEagerly': only singletons can be created eagerly."));
      });
      it('should be configurable with a factory function, as a prototype, (explicitly) lazily', function() {
        var factoryFunctionSpy;
        factoryFunctionSpy = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnAsPrototypeLazily: {
            fn: factoryFunctionSpy,
            singleton: false,
            eager: false
          }
        });
        expect(factoryFunctionSpy).not.toHaveBeenCalled();
        expect(Deft.Injector.canResolve('fnAsPrototypeLazily')).toBe(true);
      });
      describe('Resolution of a dependency configured with a factory function', function() {
        it('should resolve a dependency configured with a factory function with the corresponding singleton return value', function() {
          var fnInstance;
          expect(fnInstance = Deft.Injector.resolve('fn')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('fn')).toBe(fnInstance);
        });
        it('should resolve a dependency configured with a factory function, eagerly, with the corresponding singleton return value', function() {
          expect(Deft.Injector.resolve('fnEagerly')).toBe(expectedFnEagerlyInstance);
          expect(Deft.Injector.resolve('fnEagerly')).toBe(expectedFnEagerlyInstance);
        });
        it('should resolve a dependency configured with a factory function, (explicitly) lazily, with the corresponding singleton return value', function() {
          var fnLazilyInstance;
          expect(fnLazilyInstance = Deft.Injector.resolve('fnLazily')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('fnLazily')).toBe(fnLazilyInstance);
        });
        it('should resolve a dependency configured with a factory function, (explicitly) as a singleton, with the corresponding singleton return value', function() {
          var fnAsSingletonInstance;
          expect(fnAsSingletonInstance = Deft.Injector.resolve('fnAsSingleton')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('fnAsSingleton')).toBe(fnAsSingletonInstance);
        });
        it('should resolve a dependency configured with a factory function, (explicitly) as a singleton, eagerly, with the corresponding singleton return value', function() {
          expect(Deft.Injector.resolve('fnAsSingletonEagerly')).toBe(expectedFnAsSingletonEagerlyInstance);
          expect(Deft.Injector.resolve('fnAsSingletonEagerly')).toBe(expectedFnAsSingletonEagerlyInstance);
        });
        it('should resolve a dependency configured with a factory function, (explicitly) as a singleton, (explicitly) lazily, with the corresponding singleton return value', function() {
          var fnAsSingletonLazilyInstance;
          expect(fnAsSingletonLazilyInstance = Deft.Injector.resolve('fnAsSingletonLazily')).toBeInstanceOf('ExampleClass');
          expect(Deft.Injector.resolve('fnAsSingletonLazily')).toBe(fnAsSingletonLazilyInstance);
        });
        it('should resolve a dependency configured with a factory function, as a prototype, with the corresponding prototype return value', function() {
          var fnAsPrototypeInstance1, fnAsPrototypeInstance2;
          fnAsPrototypeInstance1 = Deft.Injector.resolve('fnAsPrototype');
          fnAsPrototypeInstance2 = Deft.Injector.resolve('fnAsPrototype');
          expect(fnAsPrototypeInstance1).toBeInstanceOf('ExampleClass');
          expect(fnAsPrototypeInstance2).toBeInstanceOf('ExampleClass');
          expect(fnAsPrototypeInstance1).not.toBe(fnAsPrototypeInstance2);
        });
        it('should resolve a dependency configured with a factory function, as a prototype, (explicitly) lazily, with the corresponding prototype return value', function() {
          var fnAsPrototypeLazilyInstance1, fnAsPrototypeLazilyInstance2;
          fnAsPrototypeLazilyInstance1 = Deft.Injector.resolve('fnAsPrototypeLazily');
          fnAsPrototypeLazilyInstance2 = Deft.Injector.resolve('fnAsPrototypeLazily');
          expect(fnAsPrototypeLazilyInstance1).toBeInstanceOf('ExampleClass');
          expect(fnAsPrototypeLazilyInstance2).toBeInstanceOf('ExampleClass');
          expect(fnAsPrototypeLazilyInstance1).not.toBe(fnAsPrototypeLazilyInstance2);
        });
      });
    });
    describeConfigurationByValueOfType = function(typeDescriptor) {
      var prefix, type, value;
      type = typeDescriptor.type;
      value = typeDescriptor.value;
      prefix = typeDescriptor.type.toLowerCase() + 'Value';
      describe("Configuration with a " + type + " value", function() {
        var createIdentifiedConfiguration;
        createIdentifiedConfiguration = function(identifier, configuration) {
          var identifiedConfiguration;
          identifiedConfiguration = {};
          identifiedConfiguration[identifier] = configuration;
          return identifiedConfiguration;
        };
        it("should be configurable with a " + type + " value", function() {
          var identifier;
          identifier = prefix;
          Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
            value: value
          }));
          expect(Deft.Injector.canResolve(identifier)).toBe(true);
        });
        it("should not be configurable with a " + type + " value, eagerly", function() {
          var identifier;
          identifier = prefix + 'Eagerly';
          expect(function() {
            Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
              value: value,
              eager: true
            }));
          }).toThrow(new Error("Error while configuring '" + identifier + "': a 'value' cannot be created eagerly."));
        });
        it("should be configurable with a " + type + " value, (explicitly) lazily", function() {
          var identifier;
          identifier = prefix + 'Lazily';
          Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
            value: value,
            eager: false
          }));
          expect(Deft.Injector.canResolve(identifier)).toBe(true);
        });
        it("should be configurable with a " + type + " value, (explicitly) as a singleton", function() {
          var identifier;
          identifier = prefix + 'AsSingleton';
          Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
            value: value,
            singleton: true
          }));
          expect(Deft.Injector.canResolve(identifier)).toBe(true);
        });
        it("should not be configurable with a " + type + " value, (explicitly) as a singleton, eagerly", function() {
          var identifier;
          identifier = prefix + 'AsSingletonEagerly';
          expect(function() {
            Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
              value: value,
              singleton: true,
              eager: true
            }));
          }).toThrow(new Error("Error while configuring '" + identifier + "': a 'value' cannot be created eagerly."));
        });
        it("should be configurable with a " + type + " value, (explicitly) as a singleton, (explicitly) lazily", function() {
          var identifier;
          identifier = prefix + 'AsSingletonLazily';
          Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
            value: value,
            singleton: true,
            eager: false
          }));
          expect(Deft.Injector.canResolve(identifier)).toBe(true);
        });
        it("should not be configurable with a " + type + " value, as a prototype", function() {
          var identifier;
          identifier = prefix + 'AsPrototype';
          expect(function() {
            Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
              value: value,
              singleton: false
            }));
          }).toThrow(new Error("Error while configuring '" + identifier + "': a 'value' can only be configured as a singleton."));
        });
        it("should not be configurable with a " + type + " value, as a prototype, eagerly", function() {
          var identifier;
          identifier = prefix + 'AsPrototypeEagerly';
          expect(function() {
            Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
              value: value,
              singleton: false,
              eager: true
            }));
          }).toThrow(new Error("Error while configuring '" + identifier + "': a 'value' cannot be created eagerly."));
        });
        it("should not be configurable with a " + type + " value, as a prototype, (explicitly) lazily", function() {
          var identifier;
          identifier = prefix + 'AsPrototypeLazily';
          expect(function() {
            Deft.Injector.configure(createIdentifiedConfiguration(identifier, {
              value: value,
              singleton: false,
              eager: false
            }));
          }).toThrow(new Error("Error while configuring '" + identifier + "': a 'value' can only be configured as a singleton."));
        });
        describe("Resolution of a dependency configured with a " + type + " value", function() {
          it("should resolve a dependency configured with a " + type + " value with the corresponding value", function() {
            var identifier;
            identifier = prefix;
            expect(Deft.Injector.resolve(identifier)).toBe(value);
          });
          it("should resolve a dependency configured with a " + type + " value with the corresponding value, (explicitly) lazily", function() {
            var identifier;
            identifier = prefix + 'Lazily';
            expect(Deft.Injector.resolve(identifier)).toBe(value);
          });
          it("should resolve a dependency configured with a " + type + " value, (explicitly) as a singleton, with the corresponding value", function() {
            var identifier;
            identifier = prefix + 'AsSingleton';
            expect(Deft.Injector.resolve(identifier)).toBe(value);
          });
          it("should resolve a dependency configured with a " + type + " value, (explicitly) as a singleton, (explicitly) lazily, with the corresponding value", function() {
            var identifier;
            identifier = prefix + 'AsSingletonLazily';
            expect(Deft.Injector.resolve(identifier)).toBe(value);
          });
        });
      });
    };
    typeDescriptors = [
      {
        type: 'Boolean',
        value: true
      }, {
        type: 'String',
        value: 'expected value'
      }, {
        type: 'Number',
        value: 3.14
      }, {
        type: 'Date',
        value: new Date()
      }, {
        type: 'Array',
        value: []
      }, {
        type: 'Object',
        value: {}
      }, {
        type: 'Class',
        value: Ext.create('ExampleClass')
      }, {
        type: 'Function',
        value: function() {}
      }
    ];
    for (_i = 0, _len = typeDescriptors.length; _i < _len; _i++) {
      typeDescriptor = typeDescriptors[_i];
      describeConfigurationByValueOfType.call(this, typeDescriptor);
    }
    configuredIdentifiers = ['classNameAsString', 'className', 'classNameEagerly', 'classNameLazily', 'classNameAsSingleton', 'classNameAsSingletonEagerly', 'classNameAsSingletonLazily', 'classNameAsPrototype', 'classNameAsPrototypeLazily', 'classNameWithParameters', 'classNameWithParametersEagerly', 'classNameWithParametersLazily', 'classNameWithParametersAsSingleton', 'classNameWithParametersAsSingletonEagerly', 'classNameWithParametersAsSingletonLazily', 'classNameWithParametersAsPrototype', 'classNameWithParametersAsPrototypeLazily', 'classNameForSingletonClass', 'classNameForSingletonClassEagerly', 'classNameForSingletonClassLazily', 'classNameForSingletonClassAsSingleton', 'classNameForSingletonClassAsSingletonEagerly', 'classNameForSingletonClassAsSingletonLazily', 'fn', 'fnEagerly', 'fnLazily', 'fnAsSingleton', 'fnAsSingletonEagerly', 'fnAsSingletonLazily', 'fnAsPrototype', 'fnAsPrototypeLazily', 'booleanValue', 'booleanValueLazily', 'booleanValueAsSingleton', 'booleanValueAsSingletonLazily', 'stringValue', 'stringValueLazily', 'stringValueAsSingleton', 'stringValueAsSingletonLazily', 'numberValue', 'numberValueLazily', 'numberValueAsSingleton', 'numberValueAsSingletonLazily', 'dateValue', 'dateValueLazily', 'dateValueAsSingleton', 'dateValueAsSingletonLazily', 'arrayValue', 'arrayValueLazily', 'arrayValueAsSingleton', 'arrayValueAsSingletonLazily', 'objectValue', 'objectValueLazily', 'objectValueAsSingleton', 'objectValueAsSingletonLazily', 'classValue', 'classValueLazily', 'classValueAsSingleton', 'classValueAsSingletonLazily', 'functionValue', 'functionValueLazily', 'functionValueAsSingleton', 'functionValueAsSingletonLazily'];
    describe('Resolution', function() {
      it('should resolve a value for configured identifiers', function() {
        var configuredIdentifier, _j, _len1;
        for (_j = 0, _len1 = configuredIdentifiers.length; _j < _len1; _j++) {
          configuredIdentifier = configuredIdentifiers[_j];
          expect(Deft.Injector.resolve(configuredIdentifier)).not.toBeNull();
        }
      });
      it('should throw an error if asked to resolve an unconfigured identifier', function() {
        expect(function() {
          Deft.Injector.resolve('unconfiguredIdentifier');
        }).toThrow(new Error("Error while resolving value to inject: no dependency provider found for 'unconfiguredIdentifier'."));
      });
      it('should pass the instance specified for resolution when lazily resolving a dependency with a factory function', function() {
        var exampleClassInstance, factoryFunction, factoryFunctionIdentifier, factoryFunctionIdentifiers, fnResolvePassedInstanceAsPrototypeFactoryFunction, fnResolvePassedInstanceAsPrototypeLazilyFactoryFunction, fnResolvePassedInstanceAsSingletonFactoryFunction, fnResolvePassedInstanceAsSingletonLazilyFactoryFunction, fnResolvePassedInstanceFactoryFunction, fnResolvePassedInstanceLazilyFactoryFunction, _j, _len1;
        factoryFunction = function() {
          return 'expected value';
        };
        exampleClassInstance = Ext.create('ExampleClass');
        fnResolvePassedInstanceFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnResolvePassedInstanceLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnResolvePassedInstanceAsSingletonFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnResolvePassedInstanceAsSingletonLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnResolvePassedInstanceAsPrototypeFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnResolvePassedInstanceAsPrototypeLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnResolvePassedInstance: {
            fn: fnResolvePassedInstanceFactoryFunction
          },
          fnResolvePassedInstanceLazily: {
            fn: fnResolvePassedInstanceLazilyFactoryFunction,
            eager: false
          },
          fnResolvePassedInstanceAsSingleton: {
            fn: fnResolvePassedInstanceAsSingletonFactoryFunction,
            singleton: true
          },
          fnResolvePassedInstanceAsSingletonLazily: {
            fn: fnResolvePassedInstanceAsSingletonLazilyFactoryFunction,
            singleton: true,
            eager: false
          },
          fnResolvePassedInstanceAsPrototype: {
            fn: fnResolvePassedInstanceAsPrototypeFactoryFunction,
            singleton: false
          },
          fnResolvePassedInstanceAsPrototypeLazily: {
            fn: fnResolvePassedInstanceAsPrototypeLazilyFactoryFunction,
            singleton: false,
            eager: false
          }
        });
        factoryFunctionIdentifiers = ['fnResolvePassedInstance', 'fnResolvePassedInstanceLazily', 'fnResolvePassedInstanceAsSingleton', 'fnResolvePassedInstanceAsSingletonLazily', 'fnResolvePassedInstanceAsPrototype', 'fnResolvePassedInstanceAsPrototypeLazily'];
        for (_j = 0, _len1 = factoryFunctionIdentifiers.length; _j < _len1; _j++) {
          factoryFunctionIdentifier = factoryFunctionIdentifiers[_j];
          Deft.Injector.resolve(factoryFunctionIdentifier, exampleClassInstance);
        }
        expect(fnResolvePassedInstanceFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnResolvePassedInstanceLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnResolvePassedInstanceAsSingletonFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnResolvePassedInstanceAsSingletonLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnResolvePassedInstanceAsPrototypeFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnResolvePassedInstanceAsPrototypeLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
      });
    });
    describe('Injection', function() {
      Ext.define('SimpleClass', {
        constructor: function() {
          return this;
        }
      });
      Ext.define('ComplexBaseClass', {
        config: {
          classNameAsString: null,
          className: null,
          classNameEagerly: null,
          classNameLazily: null,
          classNameAsSingleton: null,
          classNameAsSingletonEagerly: null,
          classNameAsSingletonLazily: null,
          classNameAsPrototype: null,
          classNameAsPrototypeLazily: null,
          classNameWithParameters: null,
          classNameWithParametersEagerly: null,
          classNameWithParametersLazily: null,
          classNameWithParametersAsSingleton: null,
          classNameWithParametersAsSingletonEagerly: null,
          classNameWithParametersAsSingletonLazily: null,
          classNameWithParametersAsPrototype: null,
          classNameWithParametersAsPrototypeLazily: null,
          classNameForSingletonClass: null,
          classNameForSingletonClassEagerly: null,
          classNameForSingletonClassLazily: null,
          classNameForSingletonClassAsSingleton: null,
          classNameForSingletonClassAsSingletonEagerly: null,
          classNameForSingletonClassAsSingletonLazily: null,
          fn: null,
          fnEagerly: null,
          fnLazily: null,
          fnAsSingleton: null,
          fnAsSingletonEagerly: null,
          fnAsSingletonLazily: null,
          fnAsPrototype: null,
          fnAsPrototypeLazily: null,
          booleanValue: null,
          booleanValueLazily: null,
          booleanValueAsSingleton: null,
          booleanValueAsSingletonLazily: null,
          stringValue: null,
          stringValueLazily: null,
          stringValueAsSingleton: null,
          stringValueAsSingletonLazily: null,
          numberValue: null,
          numberValueLazily: null,
          numberValueAsSingleton: null,
          numberValueAsSingletonLazily: null,
          dateValue: null,
          dateValueLazily: null,
          dateValueAsSingleton: null,
          dateValueAsSingletonLazily: null,
          arrayValue: null,
          arrayValueLazily: null,
          arrayValueAsSingleton: null,
          arrayValueAsSingletonLazily: null,
          objectValue: null,
          objectValueLazily: null,
          objectValueAsSingleton: null,
          objectValueAsSingletonLazily: null,
          classValue: null,
          classValueLazily: null,
          classValueAsSingleton: null,
          classValueAsSingletonLazily: null,
          functionValue: null,
          functionValueLazily: null,
          functionValueAsSingleton: null,
          functionValueAsSingletonLazily: null
        },
        constructor: function(config) {
          this.initConfig(config);
          return this;
        }
      });
      Ext.define('ComplexClass', {
        extend: 'ComplexBaseClass',
        constructor: function(config) {
          return this.callParent(arguments);
        }
      });
      Ext.define('InjectableSimpleClass', {
        extend: 'SimpleClass',
        mixins: ['Deft.mixin.Injectable'],
        inject: configuredIdentifiers,
        constructor: function(config) {
          return this.callParent(arguments);
        }
      });
      Ext.define('InjectableComplexClass', {
        extend: 'ComplexBaseClass',
        mixins: ['Deft.mixin.Injectable'],
        inject: configuredIdentifiers,
        constructor: function(config) {
          return this.callParent(arguments);
        }
      });
      it('should inject configured dependencies into properties for a given class instance', function() {
        var configuredIdentifier, resolvedValue, simpleClassInstance, _j, _len1;
        simpleClassInstance = Ext.create('SimpleClass');
        Deft.Injector.inject(configuredIdentifiers, simpleClassInstance);
        for (_j = 0, _len1 = configuredIdentifiers.length; _j < _len1; _j++) {
          configuredIdentifier = configuredIdentifiers[_j];
          expect(simpleClassInstance[configuredIdentifier]).toBeDefined();
          expect(simpleClassInstance[configuredIdentifier]).not.toBeNull();
          resolvedValue = Deft.Injector.resolve(configuredIdentifier);
          if (configuredIdentifier.indexOf('Prototype') === -1) {
            expect(simpleClassInstance[configuredIdentifier]).toBe(resolvedValue);
          } else {
            expect(simpleClassInstance[configuredIdentifier]).toBeInstanceOf(Ext.ClassManager.getClass(resolvedValue).getName());
          }
        }
      });
      it('should inject configured dependencies into configs for a given class instance', function() {
        var complexClassInstance, configuredIdentifier, getterFunctionName, resolvedValue, _j, _len1;
        complexClassInstance = Ext.create('ComplexClass');
        Deft.Injector.inject(configuredIdentifiers, complexClassInstance);
        for (_j = 0, _len1 = configuredIdentifiers.length; _j < _len1; _j++) {
          configuredIdentifier = configuredIdentifiers[_j];
          getterFunctionName = 'get' + Ext.String.capitalize(configuredIdentifier);
          expect(complexClassInstance[getterFunctionName]()).not.toBeNull();
          resolvedValue = Deft.Injector.resolve(configuredIdentifier);
          if (configuredIdentifier.indexOf('Prototype') === -1) {
            expect(complexClassInstance[getterFunctionName]()).toBe(resolvedValue);
          } else {
            expect(complexClassInstance[getterFunctionName]()).toBeInstanceOf(Ext.ClassManager.getClass(resolvedValue).getName());
          }
        }
      });
      it('should automatically inject configured dependencies into properties for a given Injectable class instance', function() {
        var configuredIdentifier, resolvedValue, simpleInjectableClassInstance, _j, _len1;
        simpleInjectableClassInstance = Ext.create('InjectableSimpleClass');
        for (_j = 0, _len1 = configuredIdentifiers.length; _j < _len1; _j++) {
          configuredIdentifier = configuredIdentifiers[_j];
          expect(simpleInjectableClassInstance[configuredIdentifier]).toBeDefined();
          expect(simpleInjectableClassInstance[configuredIdentifier]).not.toBeNull();
          resolvedValue = Deft.Injector.resolve(configuredIdentifier);
          if (configuredIdentifier.indexOf('Prototype') === -1) {
            expect(simpleInjectableClassInstance[configuredIdentifier]).toBe(resolvedValue);
          } else {
            expect(simpleInjectableClassInstance[configuredIdentifier]).toBeInstanceOf(Ext.ClassManager.getClass(resolvedValue).getName());
          }
        }
      });
      it('should automatically inject configured dependencies into configs for a given Injectable class instance', function() {
        var configuredIdentifier, getterFunctionName, injectableComplexClassInstance, resolvedValue, _j, _len1;
        injectableComplexClassInstance = Ext.create('InjectableComplexClass');
        for (_j = 0, _len1 = configuredIdentifiers.length; _j < _len1; _j++) {
          configuredIdentifier = configuredIdentifiers[_j];
          getterFunctionName = 'get' + Ext.String.capitalize(configuredIdentifier);
          expect(injectableComplexClassInstance[getterFunctionName]()).not.toBeNull();
          resolvedValue = Deft.Injector.resolve(configuredIdentifier);
          if (configuredIdentifier.indexOf('Prototype') === -1) {
            if (configuredIdentifier.indexOf('objectValue') === -1) {
              expect(injectableComplexClassInstance[getterFunctionName]()).toBe(resolvedValue);
            } else {
              expect(injectableComplexClassInstance[getterFunctionName]()).not.toBeNull();
            }
          } else {
            expect(injectableComplexClassInstance[getterFunctionName]()).toBeInstanceOf(Ext.ClassManager.getClass(resolvedValue).getName());
          }
        }
      });
      it('should throw an error if asked to inject an unconfigured identifier', function() {
        var simpleClassInstance;
        simpleClassInstance = Ext.create('SimpleClass');
        expect(function() {
          Deft.Injector.inject('unconfiguredIdentifier', simpleClassInstance);
        }).toThrow(new Error("Error while resolving value to inject: no dependency provider found for 'unconfiguredIdentifier'."));
      });
      it('should pass the instance being injected when lazily resolving a dependency with a factory function', function() {
        var exampleClassInstance, factoryFunction, factoryFunctionIdentifiers, fnInjectPassedInstanceAsPrototypeFactoryFunction, fnInjectPassedInstanceAsPrototypeLazilyFactoryFunction, fnInjectPassedInstanceAsSingletonFactoryFunction, fnInjectPassedInstanceAsSingletonLazilyFactoryFunction, fnInjectPassedInstanceFactoryFunction, fnInjectPassedInstanceLazilyFactoryFunction;
        factoryFunction = function() {
          return 'expected value';
        };
        exampleClassInstance = Ext.create('ExampleClass');
        fnInjectPassedInstanceFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnInjectPassedInstanceLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnInjectPassedInstanceAsSingletonFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnInjectPassedInstanceAsSingletonLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnInjectPassedInstanceAsPrototypeFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        fnInjectPassedInstanceAsPrototypeLazilyFactoryFunction = jasmine.createSpy().andCallFake(factoryFunction);
        Deft.Injector.configure({
          fnInjectPassedInstance: {
            fn: fnInjectPassedInstanceFactoryFunction
          },
          fnInjectPassedInstanceLazily: {
            fn: fnInjectPassedInstanceLazilyFactoryFunction,
            eager: false
          },
          fnInjectPassedInstanceAsSingleton: {
            fn: fnInjectPassedInstanceAsSingletonFactoryFunction,
            singleton: true
          },
          fnInjectPassedInstanceAsSingletonLazily: {
            fn: fnInjectPassedInstanceAsSingletonLazilyFactoryFunction,
            singleton: true,
            eager: false
          },
          fnInjectPassedInstanceAsPrototype: {
            fn: fnInjectPassedInstanceAsPrototypeFactoryFunction,
            singleton: false
          },
          fnInjectPassedInstanceAsPrototypeLazily: {
            fn: fnInjectPassedInstanceAsPrototypeLazilyFactoryFunction,
            singleton: false,
            eager: false
          }
        });
        factoryFunctionIdentifiers = ['fnInjectPassedInstance', 'fnInjectPassedInstanceLazily', 'fnInjectPassedInstanceAsSingleton', 'fnInjectPassedInstanceAsSingletonLazily', 'fnInjectPassedInstanceAsPrototype', 'fnInjectPassedInstanceAsPrototypeLazily'];
        Deft.Injector.inject(factoryFunctionIdentifiers, exampleClassInstance);
        expect(fnInjectPassedInstanceFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnInjectPassedInstanceLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnInjectPassedInstanceAsSingletonFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnInjectPassedInstanceAsSingletonLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnInjectPassedInstanceAsPrototypeFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
        expect(fnInjectPassedInstanceAsPrototypeLazilyFactoryFunction).toHaveBeenCalledWith(exampleClassInstance);
      });
    });
    describe('Runtime configuration changes', function() {
      it('should resolve using the last provider to be configured for a given identifier (i.e. configuration for the same identifier overwrites the previous configuration)', function() {
        Deft.Injector.configure({
          existingIdentifier: {
            value: 'original value'
          }
        });
        expect(Deft.Injector.resolve('existingIdentifier')).toEqual('original value');
        Deft.Injector.configure({
          existingIdentifier: {
            value: 'new value'
          }
        });
        expect(Deft.Injector.resolve('existingIdentifier')).toEqual('new value');
      });
    });
  });
}