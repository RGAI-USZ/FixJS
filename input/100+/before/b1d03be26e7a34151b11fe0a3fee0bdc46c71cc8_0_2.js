function() {
    console.log('tree -> adopt');
    function assertTwoChildren(parent, one, two) {
      assert.equal(one.parent, parent, 'one.parent is set');
      assert.equal(two.parent, parent, 'two.parent is set');

      assert.ok(!one[L], 'one has no prev');
      assert.equal(one[R], two, 'one[R] is two');
      assert.equal(two[L], one, 'two[L] is one');
      assert.ok(!two[R], 'two has no next');

      assert.equal(parent.ch[L], one, 'parent.ch[L] is one');
      assert.equal(parent.ch[R], two, 'parent.ch[R] is two');
    }

    test('the empty case', function() {
      var parent = Node();
      var child = Node();

      debugger;
      child.adopt(parent, 0, 0);

      assert.equal(child.parent, parent, 'child.parent is set');
      assert.ok(!child[R], 'child has no next');
      assert.ok(!child[L], 'child has no prev');

      assert.equal(parent.ch[L], child, 'child is parent.ch[L]');
      assert.equal(parent.ch[R], child, 'child is parent.ch[R]');
    });

    test('with two children from the left', function() {
      var parent = Node();
      var one = Node();
      var two = Node();

      one.adopt(parent, 0, 0);
      two.adopt(parent, one, 0);

      assertTwoChildren(parent, one, two);
    });

    test('with two children from the right', function() {
      var parent = Node();
      var one = Node();
      var two = Node();

      two.adopt(parent, 0, 0);
      one.adopt(parent, 0, two);

      assertTwoChildren(parent, one, two);
    });

    test('adding one in the middle', function() {
      var parent = Node();
      var prev = Node();
      var next = Node();
      var middle = Node();

      prev.adopt(parent, 0, 0);
      next.adopt(parent, prev, 0);
      middle.adopt(parent, prev, next);

      assert.equal(middle.parent, parent, 'middle.parent is set');
      assert.equal(middle[L], prev, 'middle[L] is set');
      assert.equal(middle[R], next, 'middle[R] is set');

      assert.equal(prev[R], middle, 'prev[R] is middle');
      assert.equal(next[L], middle, 'next[L] is middle');

      assert.equal(parent.ch[L], prev, 'parent.ch[L] is prev');
      assert.equal(parent.ch[R], next, 'parent.ch[R] is next');
    });
  }