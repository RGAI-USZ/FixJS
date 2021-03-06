function () {

    var moduleFake;



    beforeEach(function () {

        moduleFake = {

            myNumber: 0,

            myObj: {}

        };



        vm.runInNewContext(

            "__get__ = " + __get__.toString() + "; " +

            "setNumber = function (value) { myNumber = value; }; " +

            "setObj = function (value) { myObj = value; }; ",

            moduleFake

        );

    });

    it("should return the initial value", function () {

        expect(moduleFake.__get__("myNumber")).to.be(0);

        expect(moduleFake.__get__("myObj")).to.eql({});

    });

    it("should return the changed value of the number", function () {

        var newObj = { hello: "hello" };



        moduleFake.setNumber(2);

        moduleFake.setObj(newObj);

        expect(moduleFake.__get__("myNumber")).to.be(2);

        expect(moduleFake.__get__("myObj")).to.be(newObj);

    });

    it("should throw a ReferenceError when getting not existing vars", function () {

        expect(function () {

            moduleFake.__get__("blabla");

        }).to.throwException(expectReferenceError);

    });

    it("should throw a TypeError when passing misfitting params", function () {

        expect(function () {

            moduleFake.__get__();

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__(undefined);

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__(null);

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__(true);

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__(2);

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__("");

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__([]);

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__({});

        }).to.throwException(expectTypeError);

        expect(function () {

            moduleFake.__get__(function () {});

        }).to.throwException(expectTypeError);

    });

}