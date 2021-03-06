function () {
    EntityHud = ig.Entity.extend({
        _wmIgnore: true,
        animSheet: new ig.AnimationSheet('media/hud.png', 10, 10),
        gravityFactor: 0,

        init: function (x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('empty', 1, [0]);
            this.addAnim('full', 1, [1]);
        },

        update: function () {
            if( ig.game.hud.piece_collected ){ this.currentAnim = this.anims.full; }
            this.parent();
        }
    });
}