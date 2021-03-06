function ()
    {

        /* Empty module to require all bootstrap plugins */

        MyGame.inject({
            onShowPauseMenu: function()
            {
                if(this.showStats)
                    this.showMenu(new StatMenu("Pause"));
                else
                    this.parent();
            }

        })

        StatMenu = Menu.extend({
            invalidate: true,
            collection: {},
            collectionKey: [],
            draw: function()
            {
                this.drawModal();

                //TODO this should be moved into the utils
                var x = ig.system.width * .5;
                var y = ig.system.height * .5;
                this.menuFont.draw(this.title, x, y - 30, ig.Font.ALIGN.CENTER);
                //TODO calculate score
                var stats = ig.game.stats;
                console.log("Display stats", stats);
                if(stats)
                {
                    var i;
                    var total;

                    var displayStats = ["time","kills","doors","score"];
                    total = displayStats.length;


                    for (i = 0 ; i < total; i++)
                    {
                        var name =  displayStats[i];
                        //TODO need to come up with a better way to handle the score but this is a good hack for now
                        var points =  stats[displayStats[i]];//totalItems * this.collectionKeys[i].value * (i+1);
                        this.menuFont.draw(name+": "+ points, x, y+(10 * (i+1))+10, ig.Font.ALIGN.CENTER);
                    }

                    //this.menuFont.draw("Score : ", x, y+(10 * (i+2))+10, ig.Font.ALIGN.CENTER);
                }
            }


        })

        MyGame.inject({
            stats: null,
            storage: new ig.Storage(),
            loadLevel:function (data) {
                this.stats = {time:0, kills:0, deaths:0, doors:0, ammo:0};
                this.parent(data);
            },
            onPause: function (value)
            {
                // Update level time before displaying pause screen
                this.stats.time = Math.round(this.levelTimer.delta());
                this.stats.score = (this.stats.doors * 50) + (this.stats.kills * 5);
                this.parent(value);
            }



    })

        EntityBaseMonster.inject({
            receiveDamage: function(value, from)
            {
                this.parent(value, from);
                if(this.health <= 0)
                {
                    ig.game.stats.kills ++;
                    console.log("Add to kills", ig.game.stats.kills)

                }
            }


        })

        EntityDoor.inject({
            close: function()
            {
                ig.game.stats.doors ++;
                console.log("Add to doors", ig.game.stats.doors)
                this.parent();
            }


        })

    }