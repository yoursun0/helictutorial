/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * HelicTutorial implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * helictutorial.js
 *
 * HelicTutorial user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
], function (dojo, declare) {
  return declare("bgagame.helictutorial", ebg.core.gamegui, {
    constructor: function () {
      console.log("helictutorial constructor");

      // Here, you can init the global variables of your user interface
      // Example:
      // this.myGlobalValue = 0;
    },

    /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */

    setup: function (gamedatas) {
      console.log("Starting game setup");

      // Example to add a div on the game area
      document.getElementById("game_play_area").insertAdjacentHTML(
        "beforeend",
        `
                <div id="board">
                    <div id="discs">
                    </div>
                </div>
            `
      );

      // TODO: Set up your game interface here, according to "gamedatas"
      const board = document.getElementById("board");
      const hor_scale = 64.8;
      const ver_scale = 64.4;
      for (let x = 1; x <= 8; x++) {
        for (let y = 1; y <= 8; y++) {
          const left = Math.round((x - 1) * hor_scale + 10);
          const top = Math.round((y - 1) * ver_scale + 7);
          // we use afterbegin to make sure squares are placed before discs
          board.insertAdjacentHTML(
            `afterbegin`,
            `<div id="square_${x}_${y}" class="square" style="left: ${left}px; top: ${top}px;"></div>`
          );
        }
      }

      for (var i in gamedatas.board) {
        var square = gamedatas.board[i];
        if (square.player !== null) {
          this.addDiscOnBoard(square.x, square.y, square.player);
        }
      }

      document
        .querySelectorAll(".square")
        .forEach((square) =>
          square.addEventListener("click", (e) => this.onPlayDisc(e))
        );

      // Setup game notifications to handle (see "setupNotifications" method below)
      this.setupNotifications();

      console.log("Ending game setup");
    },

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState: function (stateName, args) {
      console.log("Entering state: " + stateName);

      switch (stateName) {
        /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */

        case "playerTurn":
          this.updatePossibleMoves(args.args.possibleMoves);
          break;
      }
    },

    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      console.log("Leaving state: " + stateName);

      switch (stateName) {
        /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */

        case "dummy":
          break;
      }
    },

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      console.log("onUpdateActionButtons: " + stateName, args);
    },

    ///////////////////////////////////////////////////
    //// Utility methods

    /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */

    addDiscOnBoard: async function (x, y, player) {
      const color = this.gamedatas.players[player].color;

      document
        .getElementById("discs")
        .insertAdjacentHTML(
          "beforeend",
          `<div class="disc" data-color="${color}" id="disc_${x}${y}"></div>`
        );

      this.placeOnObject(`disc_${x}${y}`, "overall_player_board_" + player);

      const anim = this.slideToObject(`disc_${x}${y}`, "square_" + x + "_" + y);
      await this.bgaPlayDojoAnimation(anim);
    },

    updatePossibleMoves: function (possibleMoves) {
      // Remove current possible moves
      document
        .querySelectorAll(".possibleMove")
        .forEach((div) => div.classList.remove("possibleMove"));

      for (var x in possibleMoves) {
        for (var y in possibleMoves[x]) {
          // x,y is a possible move
          document
            .getElementById(`square_${x}_${y}`)
            .classList.add("possibleMove");
        }
      }

      this.addTooltipToClass("possibleMove", "", _("Place a disc here"));
    },
    ///////////////////////////////////////////////////
    //// Player's action

    /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

    // Example:

    onPlayDisc: function (evt) {
      // Stop this event propagation
      evt.preventDefault();
      evt.stopPropagation();

      // Get the cliqued square x and y
      // Note: square id format is "square_X_Y"
      var coords = evt.currentTarget.id.split("_");
      var x = coords[1];
      var y = coords[2];

      if (
        !document
          .getElementById(`square_${x}_${y}`)
          .classList.contains("possibleMove")
      ) {
        // This is not a possible move => the click does nothing
        return;
      }

      this.bgaPerformAction("actPlayDisc", {
        x: x,
        y: y,
      });
    },

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your helictutorial.game.php file.
        
        */
    setupNotifications: function () {
      console.log("notifications subscriptions setup");

      // TODO: here, associate your game notifications with local methods

      // automatically listen to the notifications, based on the `notif_xxx` function on this class.
      this.bgaSetupPromiseNotifications();
    },

    // TODO: from this point and below, you can write your game notifications handling methods

    notif_playDisc: async function (args) {
      // Remove current possible moves (makes the board more clear)
      document
        .querySelectorAll(".possibleMove")
        .forEach((div) => div.classList.remove("possibleMove"));

      await this.addDiscOnBoard(args.x, args.y, args.player_id);
    },

    notif_turnOverDiscs: async function (args) {
      // Get the color of the player who is returning the discs
      const targetColor = this.gamedatas.players[args.player_id].color;

      // wait for the animations of all turned discs to be over before considering the notif done
      await Promise.all(
        args.turnedOver.map((disc) =>
          this.animateTurnOverDisc(disc, targetColor)
        )
      );
    },

    animateTurnOverDisc: async function (disc, targetColor) {
      const discDiv = document.getElementById(`disc_${disc.x}${disc.y}`);
      if (!this.bgaAnimationsActive()) {
        // do not play animations if the animations aren't activated (fast replay mode)
        discDiv.dataset.color = targetColor;
        return Promise.resolve();
      }

      // Make the disc blink 2 times
      const anim = dojo.fx.chain([
        dojo.fadeOut({ node: discDiv }),
        dojo.fadeIn({ node: discDiv }),
        dojo.fadeOut({
          node: discDiv,
          onEnd: () => (discDiv.dataset.color = targetColor),
        }),
        dojo.fadeIn({ node: discDiv }),
      ]); // end of dojo.fx.chain

      await this.bgaPlayDojoAnimation(anim);
    },

    notif_newScores: async function (args) {
      for (var player_id in args.scores) {
        var newScore = args.scores[player_id];
        this.scoreCtrl[player_id].toValue(newScore);
      }
    },
  });
});
